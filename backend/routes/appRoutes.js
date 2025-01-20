import express from 'express';
import * as appController from '../controllers/appController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, appController.createApp); // Create a new app
router.get('/:userId', authenticateToken, appController.getUserApps); // Fetch apps for a user
router.delete('/:appId', authenticateToken, appController.deleteApp); // Delete an app


export default router;
