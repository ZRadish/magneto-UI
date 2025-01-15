import User from '../models/userModel.js';
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

  try {
    const user = await userService.registerUserService({
      email,
      password,
      firstName,
      lastName,
      isVerified: false,
    });

    console.log("[CONTROLLER] User Created Successfully:", user);

    res.status(200).json({ user, error: null });
  } catch (error) {
    console.error("[CONTROLLER] Error:", error.message);
    res.status(500).json({ user: null, error: error.message });
  }
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

// Send email verification
export const sendEmailVerification = async (req, res) => {
  const { id, email } = req.body;

  try {
    console.log("[EMAIL VERIFICATION] Received Data:", { id, email });

    const result = await userService.emailVerificationService(id, email);

    console.log("[EMAIL VERIFICATION] Verification Email Sent Successfully:", result);

    res.status(200).json(result);
  } catch (error) {
    console.error("[EMAIL VERIFICATION] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await userService.forgotPasswordService(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify email token
export const verifyEmailToken = async (req, res) => {
  const { id, token } = req.body;
console.log("id",id);
console.log("token",token);
  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the token matches
    if (user.verificationToken !== token) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = ""; // Clear the token after verification
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error during verification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Reset password controller
export const resetPassword = async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Call the service to reset the password
    const result = await userService.resetPasswordService(userId, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
