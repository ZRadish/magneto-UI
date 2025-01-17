import express from 'express';
import { runThemeCheck } from '../controllers/themeCheckController.js';

const router = express.Router();

// POST request to run the Python script
router.post('/theme-check', runThemeCheck);

export default router;
