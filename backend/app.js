// app.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://167.71.98.114', 'http://magnetoui', 'https://magnetoui'] // Allow requests from the frontend
}));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging middleware

// Routes
import sampleRouter from './routes/sampleRoutes.js';
import userRouter from './routes/userRoutes.js';
import fileRouter from './routes/fileRoutes.js';
import appRouter from './routes/appRoutes.js'; // Import the app router
import testRouter from './routes/testRoutes.js';
import magnetoRoutes from './routes/magnetoRoutes.js';

app.use('/api/sample', sampleRouter); // Routes all requests to /api/sample to sampleRouter
app.use('/api/user', userRouter); // Routes all requests to /api/user to userRouter
app.use('/api/files', fileRouter); // Routes all requests to /api/files to fileRouter
app.use('/api/app', appRouter); // Routes all requests to /api/app to appRouter
app.use('/api/test', testRouter);
app.use('/api/magneto', magnetoRoutes); // Routes all requests to /api to magnetoRoutes

export default app;
