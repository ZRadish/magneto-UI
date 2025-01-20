import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import AdmZip from 'adm-zip';

const router = express.Router();

// MongoDB connection
const mongoURI = 'mongodb+srv://dkazzoun:dkazzoun@magneto.q1ry4.mongodb.net/Main';
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize GridFSBucket
let gfsBucket;
conn.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'files' });
});

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir); // Save temporarily
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Timestamp filename
  },
});
const upload = multer({ storage });

// Upload and Process File
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Step 1: Stream the file into GridFS for later access
    const readStream = fs.createReadStream(file.path);
    const uploadStream = gfsBucket.openUploadStream(file.originalname);

    readStream.pipe(uploadStream).on('finish', async () => {
      const fileId = uploadStream.id;

      // Step 2: Unzip the file into a temporary directory
      const unzipPath = path.join(process.cwd(), 'unzipped', `${fileId}`);
      if (!fs.existsSync(unzipPath)) {
        fs.mkdirSync(unzipPath, { recursive: true });
      }

      const zip = new AdmZip(file.path);
      zip.extractAllTo(unzipPath, true);

      // Step 3: Placeholder for running the MAGNETO Python script
      // Here, you can run the Python script using child_process or another method
      // Example:
      // exec(`python3 magneto.py ${unzipPath}`, (error, stdout, stderr) => {
      //   if (error) {
      //     console.error('Error running MAGNETO:', stderr);
      //   } else {
      //     console.log('MAGNETO output:', stdout);
      //   }
      // });

      // Clean up temporary uploaded file
      fs.unlinkSync(file.path);

      res.status(200).json({
        message: 'File uploaded and prepared for processing successfully',
        file: {
          id: fileId,
          filename: uploadStream.filename,
          path: unzipPath, // Path to the unzipped contents
        },
      });
    });
  } catch (error) {
    console.error('Error uploading or processing file:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Download File
router.get('/files/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gfsBucket.openDownloadStream(fileId);

    downloadStream.pipe(res).on('error', () => {
      res.status(404).json({ message: 'File not found' });
    });
  } catch (error) {
    console.error('Error fetching file:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get Latest File Metadata
router.get('/file-status', async (req, res) => {
  try {
    const files = await conn.db.collection('files.files').find().sort({ uploadDate: -1 }).limit(1).toArray();

    if (!files.length) {
      return res.status(404).json({ message: 'No files found' });
    }

    res.status(200).json(files[0]);
  } catch (error) {
    console.error('Error fetching file metadata:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
