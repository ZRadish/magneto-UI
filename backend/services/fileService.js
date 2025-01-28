import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import AdmZip from 'adm-zip';
import path from 'path';


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
  const filePath = file.path; // Temporary file path
  const originalName = file.originalname;

  // Step 1: Unzip the file to a temporary directory
  const unzipDir = path.join('/app/temp', 'unzipped', testId); // Use testId for uniqueness
  if (!fs.existsSync(unzipDir)) {
    fs.mkdirSync(unzipDir, { recursive: true });
  }
  const files = fs.readdirSync(unzipDir);
  console.log(files);

  const zip = new AdmZip(filePath);
  zip.extractAllTo(unzipDir, true);

  console.log(`File unzipped to: ${unzipDir}`);

  // Step 2: Stream the file into GridFS
  const readStream = fs.createReadStream(filePath);
  const uploadStream = gfsBucket.openUploadStream(originalName, {
    metadata: {
      testId: new mongoose.Types.ObjectId(testId), // Store testId as an ObjectId
    },
  });

  return new Promise((resolve, reject) => {
    readStream
      .pipe(uploadStream)
      .on('finish', async () => {
        // File successfully uploaded to GridFS
        const fileInfo = {
          id: uploadStream.id,
          fileName: uploadStream.filename,
          fileType: file.mimetype,
          uploadDate: new Date(),
          unzipPath: unzipDir, // Add the path to the unzipped files
          metadata: {
            testId: new mongoose.Types.ObjectId(testId),
          },
        };

        // Clean up the temporary file
        fs.unlinkSync(filePath);

        // Return file metadata
        resolve(fileInfo);
      })
      .on('error', (err) => {
        reject(err);
      });
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