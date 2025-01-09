import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // User's email (unique identifier)
  password: { type: String, required: true }, // User's hashed password
  firstName: { type: String, required: true }, // User's first name
  lastName: { type: String, required: true }, // User's last name
  isVerified: { type: Boolean, default: false }, // Verification status
  createdAt: { type: Date, default: Date.now }, // Account creation date
  verificationToken: { type: String, default: '' }, // Account verification token
  apps: { type: [mongoose.Schema.Types.ObjectId], ref: 'App' }, // Reference to apps related to the user
  lastLogin: { type: Date, default: null }, // Timestamp of the last login
  profilePicture: { type: String, default: '' } // Optional: URL to the user's profile picture
});

const User = mongoose.model('User', userSchema, 'Users'); // Third parameter specifies the collection name
export default User;
