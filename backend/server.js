// Import dependencies and configuration
import app from './index.js';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

// Configure environment variables from .env file
dotenv.config();

// Define the port the server will run on, defaulting to 5000 if not specified in .env
const PORT = process.env.PORT || 5000;

// Start listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// MongoDB connection URL
const url = process.env.MONGODB_URI;

// Set up the MongoDB client with options
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB asynchronously
(async function() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error(e);
  }
})();

// Middleware setup for CORS and parsing JSON requests
app.use(cors());
app.use(bodyParser.json());

// LOGIN API endpoint: Authenticates users based on email and password
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  let error = '';
  let user = null;

  try {
    // Connect to the Main database and Users collection
    const db = client.db('Main');
    const usersCollection = db.collection('Users');

    // Search for a user matching the provided email and password
    const results = await usersCollection.findOne({ email, password });

    // If user exists, return user details; otherwise, return an error
    if (results) {
      user = {
        id: results._id,
        firstName: results.firstName,
        lastName: results.lastName,
        email: results.email,
        isVerified: results.isVerified
      };
    } else {
      error = 'Invalid login credentials';
    }
  } catch (e) {
    error = e.toString();
  }

  // Send back user info or error message
  const ret = { user: user, error: error };
  res.status(200).json(ret);
});

// REGISTER API endpoint: Registers a new user in the database
app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName, isVerified } = req.body;

  let error = '';
  let success = false;

  try {
    // Connect to the Main database and Users collection
    const db = client.db('Main');
    const usersCollection = db.collection('Users');

    // Check if a user with the given email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      error = 'User already exists';
    } else {
      // Generate a new ObjectId for the user
      const userId = new ObjectId();

      // Insert the new user's details into the Users collection
      const result = await usersCollection.insertOne({
        _id: userId,
        email,
        password,
        firstName,
        lastName,
        isVerified : false
      });

      // If insertion was successful, set success to true
      success = result.acknowledged;
    }
  } catch (e) {
    error = e.toString();
  }

  // Send back success status or error message
  const ret = { success: success, error: error };
  res.status(200).json(ret);
});

// DELETE USER API endpoint: Deletes a user from the database by ID
app.delete('/api/deleteUser', async (req, res) => {
  const { id } = req.body; // Unique identifier for the user to delete

  let error = '';
  let success = false;

  try {
    // Connect to the Main database and Users collection
    const db = client.db('Main');
    const usersCollection = db.collection('Users');

    // Delete user based on the provided _id
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    // If one document was deleted, set success to true; otherwise, report an error
    if (result.deletedCount === 1) {
      success = true;
    } else {
      error = 'User not found or could not be deleted';
    }
  } catch (e) {
    error = e.toString();
  }

  // Send back success status or error message
  const ret = { success: success, error: error };
  res.status(200).json(ret);
});

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
