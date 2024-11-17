import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Define the directories for uploads and extraction
const UPLOAD_DIR = path.join(process.cwd(), 'uploads'); // Ensure 'uploads' is in the project root
const EXTRACT_DIR = path.join(process.cwd(), 'extracted'); // Ensure 'extracted' is in the project root
const FILE_LOG_PATH = path.join(UPLOAD_DIR, 'file-log.json'); // Log file stored in 'uploads'

// Ensure required directories exist
[UPLOAD_DIR, EXTRACT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Save File Information
// Stores metadata of the uploaded file into 'file-log.json'
export const saveFileInfo = async (file) => {
  const fileInfo = {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    timestamp: Date.now(),
  };

  fs.writeFileSync(FILE_LOG_PATH, JSON.stringify(fileInfo, null, 2)); // Write file info to log
  return fileInfo;
};

// Process File
// Unzips the specified file into a subdirectory within the 'extracted' folder
export const processFile = async (filename) => {
  const zipPath = path.join(UPLOAD_DIR, filename); // Path to the ZIP file in 'uploads'
  const extractPath = path.join(EXTRACT_DIR, path.parse(filename).name); // Subdirectory in 'extracted'

  // Check if the ZIP file exists
  if (!fs.existsSync(zipPath)) {
    throw new Error('File not found');
  }

  // Ensure the extraction directory exists
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  // Unzip the file
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true); // Extract all contents to the directory

  return extractPath; // Return the extraction path
};

// Get File Status
// Reads and returns metadata of the most recently uploaded file
export const getFileStatus = async () => {
  if (!fs.existsSync(FILE_LOG_PATH)) {
    return null; // Return null if the log file doesn't exist
  }

  const fileInfo = JSON.parse(fs.readFileSync(FILE_LOG_PATH)); // Read and parse log file
  return fileInfo;
};
