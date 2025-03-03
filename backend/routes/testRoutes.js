import express from 'express';
import * as testController from '../controllers/testController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, testController.createTest); // Create a test
router.get('/:appId', authenticateToken, testController.getTestsByApp); // Get tests for a specific app
router.delete('/:testId', testController.deleteTest); // Delete test by ID
router.patch('/:testId/notes', authenticateToken, testController.updateTestNotes); // Update test notes by testId
router.get('/result_download/:testId', authenticateToken, testController.downloadTestResult);


export default router;
