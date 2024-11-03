// services/userService.js
import User from '../models/userModel.js'; // Import the User model

// Function to authenticate a user (login)
export const loginUserService = async (email, password) => {
  try {
    // Find the user by email and password
    return await User.findOne({ email, password });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to register a new user
export const registerUserService = async (userData) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // If not, create and save the new user
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to delete a user by ID
export const deleteUserService = async (id) => {
  try {
    // Delete the user by ID
    const result = await User.deleteOne({ _id: id });
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};