import express from 'express';
import multer from 'multer';
import * as fileController from '../controllers/fileController.js';
import path from 'path'; // Import the path module

const router = express.Router();

// Configure Multer for file uploads

// Define how and where files should be stored
const storage = multer.diskStorage({
    // Set the destination folder for uploaded files
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), 'uploads')); // Save files in the 'uploads' directory
    },
  
    // Use the original filename for the uploaded file
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  // Set up Multer with storage, file validation, and size limits
  const upload = multer({
    storage: storage,
  
    // Validate the file type to allow only .zip files
    fileFilter: (req, file, cb) => {
      if (path.extname(file.originalname).toLowerCase() === '.zip') {
        cb(null, true); // Accept .zip files
      } else {
        cb(new Error('Only ZIP files are allowed')); // Reject other file types
      }
    },
  
    // Limit the file size to 50MB
    limits: { fileSize: 1024 * 1024 * 50 },
  });
  

// Define routes
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.post('/process/:filename', fileController.processFile);
router.get('/file-status', fileController.getFileStatus);

export default router;
