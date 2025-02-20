import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import sgMail from '@sendgrid/mail'; // Import SendGrid for email
import mongoose from 'mongoose';
import App from '../models/appModel.js';
import Test from '../models/testModel.js';


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
      { expiresIn: '24h' } // Token expiration (1 hour)
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
export const deleteUserService = async (userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log("[DEBUG] Deleting user:", userId);

        // Find all apps owned by the user
        const apps = await App.find({ userId: userObjectId }).session(session);
        const appIds = apps.map(app => app._id);

        console.log(`[DEBUG] Found ${apps.length} apps to delete.`);

        // Find all tests associated with these apps
        const tests = await Test.find({ appId: { $in: appIds } }).session(session);
        const fileIds = tests
            .filter(test => test.fileId) // Only keep tests that have an associated file
            .map(test => new mongoose.Types.ObjectId(test.fileId)); // Convert fileId to ObjectId

        console.log(`[DEBUG] Found ${tests.length} tests to delete.`);
        console.log(`[DEBUG] Found ${fileIds.length} files to delete.`);

        // Step 1: Delete all tests associated with the user's apps
        await Test.deleteMany({ appId: { $in: appIds } }).session(session);
        console.log("[DEBUG] Deleted tests.");

        // Step 2: Delete all apps owned by the user
        await App.deleteMany({ userId: userObjectId }).session(session);
        console.log("[DEBUG] Deleted apps.");

        // Step 3: Delete associated files from GridFS (files.files and files.chunks)
        if (fileIds.length > 0) {
            try {
                const db = mongoose.connection.db;
                console.log("[DEBUG] Deleting files from GridFS...");

                await db.collection('files.files').deleteMany({ _id: { $in: fileIds } });
                await db.collection('files.chunks').deleteMany({ files_id: { $in: fileIds } });

                console.log(`[DEBUG] Successfully deleted ${fileIds.length} files from GridFS.`);
            } catch (error) {
                console.error(`[ERROR] Failed to delete files for user ${userId}: ${error.message}`);
            }
        }

        // Step 4: Delete the user from the Users collection
        const deletedUser = await User.findByIdAndDelete(userObjectId, { session });

        if (!deletedUser) {
            throw new Error("User not found or could not be deleted.");
        }

        console.log("[DEBUG] User Delete Result:", deletedUser);

        await session.commitTransaction();
        session.endSession();

        return { success: true, message: "User and all associated data deleted successfully." };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("[SERVICE] Error in deleteUserService:", error.message);
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
    from: 'magnetouiweb@gmail.com',
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

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('No account found with that email');

  const resetToken = generateVerificationToken();
  user.verificationToken = resetToken;
  await user.save();

  console.log('[SERVICE] Generated resetToken:', resetToken);
  console.log('[SERVICE] UserId (_id):', user._id);

  await sendEmail(email, 'Reset Your Password', 'd-221335c49e0c4f3493664c326579d1cc', {
    firstName: user.firstName,
    verificationCode: resetToken,
  });

  return {
    success: true,
    userId: user._id.toString(), // Correctly map `_id` to `userId`
  };
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
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert string to ObjectId

    const user = await User.findById(userObjectId);
    if (!user) {
      throw new Error("User not found.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("[SERVICE] Password updated successfully for user:", userId);
    return { success: true, message: "Password reset successfully." };
  } catch (error) {
    console.error("[SERVICE] Error in resetPasswordService:", error.message);
    throw new Error(error.message);
  }
};

