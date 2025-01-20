import express from 'express';
import { runThemeCheck } from '../controllers/magnetoController.js';
import { runBackButton } from '../controllers/magnetoController.js';

const router = express.Router();

// POST request to run the Python script
router.post('/theme-check', runThemeCheck);
router.post('/back-button', runBackButton);

export default router;
