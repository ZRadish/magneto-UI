// controllers/fileController.js

// Import file service for business logic
import * as fileService from '../services/fileService.js';

// Upload File
// Validates and saves uploaded file information, responding with success or error
export const uploadFile = async (req, res) => {
  try {
    // Ensure a file is provided
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save file information and return it
    const fileInfo = await fileService.saveFileInfo(req.file);

    res.status(200).json({
      message: 'File uploaded successfully',
      file: fileInfo,
    });
  } catch (error) {
    console.error('Error handling upload:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Process File
// Unzips the specified file and prepares it for further processing
export const processFile = async (req, res) => {
  const { filename } = req.params;

  try {
    // Unzip the file and get the extraction path
    const extractedPath = await fileService.processFile(filename);

    // Placeholder for script execution logic
    // Add code here to execute additional scripts with `extractedPath` as input
    /*
    Example:
    exec(`python3 path/to/script.py ${extractedPath}`, (error, stdout, stderr) => {
      if (error) {
        throw new Error(`Error running script: ${stderr}`);
      }
      console.log('Script output:', stdout);
    });
    */

    res.status(200).json({
      message: 'File processed successfully',
      extractedPath: extractedPath,
    });
  } catch (error) {
    console.error('Processing error:', error.message);
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
};

// Get File Status
// Retrieves the metadata of the most recently uploaded file
export const getFileStatus = async (req, res) => {
  try {
    // Get file info from the log
    const fileInfo = await fileService.getFileStatus();

    if (!fileInfo) {
      return res.status(404).json({ message: 'No file log found' });
    }

    res.status(200).json(fileInfo);
  } catch (error) {
    console.error('Error retrieving file status:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
