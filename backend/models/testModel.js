import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true }, // Reference to the associated App
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the associated User
  testName: { type: String, required: true }, // Name of the test
  oraclesSelected: { type: [String], default: [] }, // Oracles selected for the test
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true }, // Associated file ID
  status: { 
    type: String, 
    enum: ['completed', 'pending'], 
    default: 'pending' 
  }, // Status of the test
  result: { type: String, default: '' }, // Result of the test
  notes: { type: String, default: '' }, // Notes for the test
  createdAt: { type: Date, default: Date.now }, // Date when the test was created
});

const Test = mongoose.model('Test', testSchema, 'Tests'); // Third parameter specifies the collection name
export default Test;
