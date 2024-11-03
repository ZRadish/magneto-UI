// Import dependencies and configuration
import app from './index.js';
import dotenv from 'dotenv';

// Configure environment variables from .env file
dotenv.config();

// Define the port the server will run on, defaulting to 5000 if not specified in .env
const PORT = process.env.PORT || 5000;

// Start listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});