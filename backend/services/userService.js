import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config(); // Load environment variables

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
      throw new Error('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new User({ ...userData, password: hashedPassword });
    await newUser.save();

    return newUser;
  } catch (error) {
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

