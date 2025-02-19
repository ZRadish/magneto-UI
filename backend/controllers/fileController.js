import * as fileService from '../services/fileService.js';
import { saveFileInfo } from '../services/fileService.js';

// Upload File
export const uploadFile = async (req, res) => {
  try {
    const { testId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!testId) {
      return res.status(400).json({ message: 'testId is required' });
    }

    // Save the file to GridFS and unzip it
    const fileInfo = await saveFileInfo(req.file, testId);

    res.status(200).json({
      message: 'File uploaded and unzipped successfully',
      file: fileInfo,
    });
  } catch (error) {
    console.error('Error during file upload:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Process File
export const processFile = async (req, res) => {
  const { filename } = req.params;

  try {
    const result = await fileService.processFile(filename);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during file processing:', error.message);
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
};

// Get File Status
export const getFileStatus = async (req, res) => {
  try {
    const fileInfo = await fileService.getFileStatus(req.user.id);

    if (!fileInfo) {
      return res.status(404).json({ message: 'No file log found' });
    }

    res.status(200).json(fileInfo);
  } catch (error) {
    console.error('Error retrieving file status:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

