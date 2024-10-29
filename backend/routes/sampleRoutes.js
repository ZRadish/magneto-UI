// routes/sampleRoutes.js
import express from 'express';
import { getSampleData, runPythonScript } from '../controllers/sampleController.js';

const router = express.Router();

router.get('/hello', getSampleData); // GET /api/sample/hello
router.get('/run-python', runPythonScript); // GET /api/sample/run-python

export default router;