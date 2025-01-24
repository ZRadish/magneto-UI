import express from 'express';
import { runThemeCheck } from '../controllers/magnetoController.js';
import { runBackButton } from '../controllers/magnetoController.js';
import { runLanguageDetection } from '../controllers/magnetoController.js';
import { runUserEnteredData } from '../controllers/magnetoController.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST request to run the Python script
router.post('/theme-check', runThemeCheck);
router.post('/back-button', runBackButton);
router.post('/language-detection', runLanguageDetection);
router.post('/user-entered-data', runUserEnteredData);

export default router;
