import * as fileService from '../services/fileService.js';

// Upload File
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = await fileService.saveFileInfo(req.file);
    res.status(200).json({
      message: 'File uploaded successfully',
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
