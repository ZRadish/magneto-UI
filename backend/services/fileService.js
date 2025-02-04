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

// Initialize GridFSBuckets for both uploaded files and results (PDFs)
let gfsBucket, resultsBucket;
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'files' });
  resultsBucket = new GridFSBucket(conn.db, { bucketName: 'results' });
});

/**
 * Save uploaded file and unzip it
 */
export const saveFileInfo = async (file, testId) => {
  const filePath = file.path; // Temporary file path
  const originalName = file.originalname;

  // Step 1: Unzip the file to a temporary directory
  const unzipDir = path.join('/app/temp', 'unzipped', testId); // Use testId for uniqueness
  if (!fs.existsSync(unzipDir)) {
    fs.mkdirSync(unzipDir, { recursive: true });
  }

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
        const fileInfo = {
          id: uploadStream.id,
          fileName: uploadStream.filename,
          fileType: file.mimetype,
          uploadDate: new Date(),
          unzipPath: unzipDir,
          metadata: {
            testId: new mongoose.Types.ObjectId(testId),
          },
        };

        fs.unlinkSync(filePath); // Clean up temporary file
        resolve(fileInfo);
      })
      .on('error', (err) => reject(err));
  });
};
export const storePdfInGridFS = async (testId, pdfFileName, argB) => {
  // ✅ Update the PDF path with `argB`
  const pdfPath = path.join('/app/temp/unzipped', testId, argB, pdfFileName);

  if (!fs.existsSync(pdfPath)) {
    console.error(`[SERVICE] PDF file does not exist: ${pdfPath}`);
    throw new Error(`PDF file not found at: ${pdfPath}`);
  } else {
    console.log(`[SERVICE] Storing PDF in GridFS: ${pdfPath}`);
  }

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(pdfPath);
    const uploadStream = resultsBucket.openUploadStream(pdfFileName, {
      metadata: {
        testId: new mongoose.Types.ObjectId(testId),
        fileType: 'application/pdf',
      },
    });

    readStream
      .pipe(uploadStream)
      .on('finish', () => {
        console.log(`[SERVICE] PDF successfully stored in GridFS: ${uploadStream.id}`);
        resolve(uploadStream.id.toString());
      })
      .on('error', (err) => {
        console.error('[SERVICE] Error storing PDF in GridFS:', err);
        reject(err);
      });
  });
};

/**
 * Retrieve the stored PDF file from GridFS (for preview/download)
 */
export const getPdfFromGridFS = async (fileId, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid fileId format' });
    }

    const objectId = new mongoose.Types.ObjectId(fileId);
    const fileMetadata = await conn.db.collection('results.files.files').findOne({ _id: objectId });

    if (!fileMetadata) {
      return res.status(404).json({ message: 'PDF file not found in GridFS' });
    }

    res.setHeader('Content-Disposition', `inline; filename="${fileMetadata.filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    const downloadStream = resultsBucket.openDownloadStream(objectId);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('[SERVICE] Error streaming PDF:', err.message);
      res.status(500).json({ message: 'Error streaming PDF' });
    });
  } catch (error) {
    console.error('[SERVICE] Error in getPdfFromGridFS:', error.message);
    res.status(500).json({ message: 'Failed to retrieve PDF from GridFS', error: error.message });
  }
};

/**
 * Get the latest uploaded file status
 */
export const getFileStatus = async (userId) => {
  const Files = conn.db.collection('files');
  const fileInfo = await Files.find({ userId }).sort({ uploadDate: -1 }).limit(1).toArray();
  return fileInfo.length === 0 ? null : fileInfo[0];
};