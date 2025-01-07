import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

// MongoDB connection
const mongoURI = 'mongodb+srv://dkazzoun:dkazzoun@magneto.q1ry4.mongodb.net/Main';
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize GridFS Bucket
let gfsBucket;
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'files' });
});

// Save File Metadata
// Save File Metadata with the updated schema
export const saveFileInfo = async (file, userId = null, appId = null, testId = null) => {
  const fileInfo = {
    fileName: file.filename,
    fileType: file.mimetype,
    uploadDate: new Date(),
    userId: userId || null, // Optional: Reference to the user who uploaded the file
    metadata: {
      appId: appId || null, // Optional: Reference to the associated app
      testId: testId || null, // Optional: Reference to the associated test
    },
  };

  const Files = conn.db.collection('Files');
  const result = await Files.insertOne(fileInfo); // Insert metadata into MongoDB
  return result.ops[0];
};


// Process File
export const processFile = async (filename) => {
  const Files = conn.db.collection('Files');

  const file = await Files.findOne({ filename });
  if (!file) {
    throw new Error('File not found');
  }

  // Create a readable stream for processing the file
  const readStream = gfsBucket.openDownloadStreamByName(filename);

  // Placeholder for file processing logic
  return { message: 'File processing simulated', file };
};

// Get File Status
export const getFileStatus = async () => {
  const Files = conn.db.collection('Files');

  // Fetch the latest file metadata
  const fileInfo = await Files.find().sort({ uploadDate: -1 }).limit(1).toArray();
  if (fileInfo.length === 0) {
    return null;
  }

  return fileInfo[0];
};
