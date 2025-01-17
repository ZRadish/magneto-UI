import mongoose from 'mongoose';

const appSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appName: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }], // Optional tests array
});

const App = mongoose.model('App', appSchema, 'Apps');
export default App;
