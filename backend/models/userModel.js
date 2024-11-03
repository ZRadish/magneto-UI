// models/userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  verificationToken: { type: String, default: '' },
  apps: { type: [mongoose.Schema.Types.ObjectId], ref: 'App' }
});

const User = mongoose.model('User', userSchema, 'Users'); //third parameter is the collection name in the database
export default User;
