// app.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173' // Allow requests from the frontend
}));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging middleware

// Routes
import sampleRouter from './routes/sampleRoutes.js';
import userRouter from './routes/userRoutes.js';
import fileRouter from './routes/fileRoutes.js'; // Import the file router

app.use('/api/sample', sampleRouter); // Routes all requests to /api/sample to sampleRouter
app.use('/api/user', userRouter); // Routes all requests to /api/user to userRouter
app.use('/api/files', fileRouter); // Routes all requests to /api/files to fileRouter

export default app;
