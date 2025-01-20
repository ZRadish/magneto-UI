import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', userController.loginUser); // Login: No token needed
router.post('/register', userController.registerUser); // Register: No token needed
router.get('/info', authenticateToken, userController.getUserInfo); // Get user info: Token required
router.delete('/delete', authenticateToken, userController.deleteUser); // Delete user: Token required
// Email verification routes
router.post('/email/verify', userController.sendEmailVerification); // Send verification email
router.post('/email/verify-token', userController.verifyEmailToken); // Verify email token

// Forgot password routes
router.post('/password/forgot', userController.forgotPassword); // Send forgot password email
// Reset password route
router.post('/password/reset', userController.resetPassword); // Endpoint for resetting password

export default router;
