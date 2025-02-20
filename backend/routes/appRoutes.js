import express from 'express';
import * as appController from '../controllers/appController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, appController.createApp); // Create a new app
router.get('/:userId', authenticateToken, appController.getUserApps); // Fetch apps for a user
router.delete('/:appId', authenticateToken, appController.deleteApp); // Delete an app
router.patch('/:appId/name', authenticateToken, appController.updateAppName); // Update app name
router.patch('/:appId/description', authenticateToken, appController.updateAppDescription); // Update app description


export default router;
