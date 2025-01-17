// Import dependencies and configuration
import app from './index.js';
import dotenv from 'dotenv';
import path from 'path';
import express from 'express';

// Configure environment variables from .env file
dotenv.config();

// Define the port the server will run on, defaulting to 5000 if not specified in .env
const PORT = process.env.PORT || 5000;

// Serve the static files from the React frontend build
const __dirname = path.resolve(); // Resolve the current directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// For any route not handled by other middleware, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
