import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import sgMail from '@sendgrid/mail'; // Import SendGrid for email
import crypto from 'crypto'; // For generating tokens

dotenv.config(); // Load environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set SendGrid API key

const JWT_SECRET = process.env.JWT_SECRET;

export const loginUserService = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid login credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare hashed passwords
    if (!isMatch) {
      throw new Error('Invalid login credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: '1h' } // Token expiration (1 hour)
    );

    return { user, token }; // Return user and token
  } catch (error) {
    throw new Error(error.message);
  }
};

// Register User (Hash Password Before Saving)
export const registerUserService = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({ ...userData, password: hashedPassword });
    await newUser.save();

    console.log("[SERVICE] New User Created:", newUser);

    return {
      id: newUser._id.toString(), // Return `_id` as `id`
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      isVerified: newUser.isVerified,
    };
  } catch (error) {
    console.error("[SERVICE] Error:", error.message);
    throw new Error(error.message);
  }
};


// Delete a user by ID
export const deleteUserService = async (id) => {
  try {
    return await User.deleteOne({ _id: id });
  } catch (error) {
    throw new Error(error.message);
  }
};


// Fetch user details by ID
export const getUserInfoService = async (id) => {
  try {
    // Find the user by ID and exclude sensitive fields like password
    return await User.findById(id, '-password -verificationToken');
  } catch (error) {
    throw new Error(error.message);
  }
};

// Generate a 6-digit verification code
const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Random number between 100000 and 999999
};

// Send an email
const sendEmail = async (to, subject, templateId, dynamicTemplateData) => {
  const msg = {
    to,
    from: 'dkazzoun@gmail.com',
    templateId, // SendGrid template ID
    dynamicTemplateData, // Dynamic data for the email template
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};

// Email verification service
export const emailVerificationService = async (userId, email) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const verificationToken = generateVerificationToken();
  user.verificationToken = verificationToken;
  await user.save();

  await sendEmail(email, 'Verify Your Email', 'd-8a017c719e704360a5da728fc5fa0e10', {
    firstName: user.firstName,
    verificationCode: verificationToken,
  });

  return { success: true };
};

// Forgot password service
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('No account found with that email');

  const resetToken = generateVerificationToken();
  user.verificationToken = resetToken;
  await user.save();

  await sendEmail(email, 'Reset Your Password', 'd-221335c49e0c4f3493664c326579d1cc', {
    firstName: user.firstName,
    verificationCode: resetToken,
  });

  return { success: true };
};

// Verify email token service
export const verifyEmailTokenService = async (userId, token) => {
  const user = await User.findById(userId);
  if (!user || user.verificationToken !== token) throw new Error('Invalid or expired token');

  user.isVerified = true;
  user.verificationToken = '';
  await user.save();

  return { success: true };
};

// Reset password service
export const resetPasswordService = async (userId, newPassword) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;

    // Clear the verification token (if applicable)
    user.verificationToken = '';
    await user.save();

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    throw new Error(error.message);
  }
};
