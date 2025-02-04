import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true }, // Reference to the associated App
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the associated User
  testName: { type: String, required: true }, // Name of the test
  oracleSelected: { type: String, required: true }, // Oracle selected for the test
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'files.files', default: null }, // Default to null
  status: { 
    type: String, 
    enum: ['completed', 'pending'], 
    default: 'pending' 
  }, // Status of the tests
  result: { type: String, default: '' }, // Result of the test
  notes: { type: String, default: '' }, // Notes for the test
  createdAt: { type: Date, default: Date.now }, // Date when the test was created
});

const Test = mongoose.model('Test', testSchema, 'Tests'); // Third parameter specifies the collection name
export default Test;