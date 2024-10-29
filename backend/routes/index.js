// routes/index.js
import express from 'express';
import sampleRouter from './sampleRoutes.js';

const router = express.Router();

router.use('/sample', sampleRouter); // Routes all requests to /api/sample to sampleRouter

export default router;
