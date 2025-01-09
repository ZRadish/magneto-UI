import * as userService from '../services/userService.js';

// LOGIN API: Authenticates user based on email and password
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { user, token } = await userService.loginUserService(email, password);

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified
      },
      token,
      error: ''
    });
  } catch (error) {
    res.status(401).json({ user: null, token: null, error: error.message });
  }
};

// REGISTER API: Registers a new user
export const registerUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  let error = '';
  let success = false;

  try {
    await userService.registerUserService({ email, password, firstName, lastName, isVerified: false });
    success = true;
  } catch (e) {
    error = e.toString();
  }

  res.status(200).json({ success, error });
};

// DELETE USER API: Deletes a user based on their ID
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the decoded token (set by the middleware)

    const result = await userService.deleteUserService(userId);
    if (result.deletedCount === 1) {
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }

    res.status(404).json({ success: false, error: 'User not found or could not be deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET USER INFO API: Fetches user details by ID
export const getUserInfo = async (req, res) => {
  try {
    const user = await userService.getUserInfoService(req.user.id); // Get user ID from the decoded token
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
