import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', userController.loginUser); // Login: No token needed
router.post('/register', userController.registerUser); // Register: No token needed
router.get('/info', authenticateToken, userController.getUserInfo); // Get user info: Token required
router.delete('/delete', authenticateToken, userController.deleteUser); // Delete user: Token required

export default router;