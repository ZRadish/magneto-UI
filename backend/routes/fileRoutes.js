import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import * as fileController from '../controllers/fileController.js';

const router = express.Router();

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing or invalid' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Attach decoded token payload to the request
    next();
  });
};

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir); // Temporary directory for file storage
  },
  filename: (req, file, cb) => {
    // Use the original file name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post('/upload', authenticateToken, upload.single('file'), fileController.uploadFile);
router.post('/process/:filename', authenticateToken, fileController.processFile);
router.get('/file-status', authenticateToken, fileController.getFileStatus);


export default router;