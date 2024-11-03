// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// MongoDB connection string from the .env file
const connectionString = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(connectionString)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Export the Mongoose instance
export default mongoose;
