// app.js
import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173' // Allow requests from the frontend
  }));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging middleware

// Routes
app.use('/api', routes); //all routes start with /api

export default app;