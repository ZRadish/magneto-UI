// routes/sampleRoutes.js
import express from 'express';
import * as sampleController from '../controllers/sampleController.js';

const router = express.Router();

router.get('/hello', sampleController.getSampleData); // GET /api/sample/hello
router.get('/run-python', sampleController.runPythonScript); // GET /api/sample/run-python

export default router;