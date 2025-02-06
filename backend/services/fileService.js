import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import AdmZip from 'adm-zip';
import path from 'path';
import Test from '../models/testModel.js'; 


// Load environment variables from the .env file
dotenv.config();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize GridFSBucket
let gfsBucket;
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'files' });
});


export const saveFileInfo = async (file, testId) => {
  const filePath = file.path;
  const originalName = file.originalname;

  // Ensure the unzip directory exists
  const unzipDir = path.join('/app/temp', 'unzipped', testId);
  if (!fs.existsSync(unzipDir)) {
    fs.mkdirSync(unzipDir, { recursive: true });
  }

  // Unzip the file
  const zip = new AdmZip(filePath);
  zip.extractAllTo(unzipDir, true);
  console.log(`File unzipped to: ${unzipDir}`);

  // Stream file into GridFS
  const readStream = fs.createReadStream(filePath);
  const uploadStream = gfsBucket.openUploadStream(originalName, {
    metadata: { testId: new mongoose.Types.ObjectId(testId) },
  });

  return new Promise((resolve, reject) => {
    readStream
      .pipe(uploadStream)
      .on('finish', async () => {
        const fileInfo = {
          id: uploadStream.id,
          fileName: uploadStream.filename,
          fileType: file.mimetype,
          uploadDate: new Date(),
          unzipPath: unzipDir,
          metadata: { testId: new mongoose.Types.ObjectId(testId) },
        };

        // Remove temporary file
        fs.unlinkSync(filePath);

        try {
          // Update the corresponding test with the uploaded file ID
          const updatedTest = await Test.findByIdAndUpdate(
            testId,
            { $set: { fileId: uploadStream.id } },
            { new: true }
          );

          if (!updatedTest) {
            console.error(`Test with ID ${testId} not found to update fileId`);
          } else {
            console.log(`Updated Test ${testId} with fileId: ${uploadStream.id}`);
          }
        } catch (error) {
          console.error('Error updating test with fileId:', error.message);
        }

        resolve(fileInfo);
      })
      .on('error', (err) => reject(err));
  });
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
export const getFileStatus = async (userId) => {
  const Files = conn.db.collection('Files');

  // Fetch the latest file metadata for the user
  const fileInfo = await Files.find({ userId }).sort({ uploadDate: -1 }).limit(1).toArray();
  if (fileInfo.length === 0) {
    return null;
  }

  return fileInfo[0];
};
