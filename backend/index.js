// index.js
import dotenv from 'dotenv';
//import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('Connected to MongoDB');
// }).catch((error) => {
//   console.error('MongoDB connection error:', error);
// });

export default app;
