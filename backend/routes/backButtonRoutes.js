import express from 'express';
import { runBackButton } from '../controllers/backButtonController.js';

const router = express.Router();

// POST request to run the Python script
router.post('/back-button', runBackButton);

export default router;