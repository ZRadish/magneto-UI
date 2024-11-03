// controllers/userController.js
import * as userService from '../services/userService.js';

// LOGIN API endpoint: Authenticates users based on email and password
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  let error = '';
  let user = null;

  try {

    // Search for a user matching the provided email and password
    const results = await userService.loginUserService(email, password);

    // If user exists, return user details; otherwise, return an error
    if (results) {
        user = {
          id: results._id,
          firstName: results.firstName,
          lastName: results.lastName,
          email: results.email,
          isVerified: results.isVerified,
        };
    } else {
        error = 'Invalid login credentials';
    }
  } catch (e) {
    error = e.toString();
  }

  // Send back user info or error message
  const ret = { user: user, error: error };
  res.status(200).json(ret);
};

// REGISTER API endpoint: Registers a new user in the database
export const registerUser = async (req, res) => {
  const { email, password, firstName, lastName, isVerified } = req.body;

  let error = '';
  let success = false;

  try {

    await userService.registerUserService({
        email,
        password,
        firstName,
        lastName,
        isVerified: false,
      });

    // If insertion was successful, set success to true
    success = true;
  } catch (e) {
    error = e.toString();
  }

  // Send back success status or error message
  const ret = { success: success, error: error };
  res.status(200).json(ret);
};

// DELETE USER API endpoint: Deletes a user from the database by ID
export const deleteUser = async (req, res) => {
  const { id } = req.body;

  let error = '';
  let success = false;

  try {
    // Use Mongoose to delete the user by ID
    const result = await userService.deleteUserService(id);
    // If one document was deleted, set success to true; otherwise, report an error
    if (result.deletedCount === 1) {
        success = true;
    } else {
        error = 'User not found or could not be deleted';
    }
  } catch (e) {
    error = e.toString();
  }

  // Send back success status or error message
  const ret = { success: success, error: error };
  res.status(200).json(ret);
};
