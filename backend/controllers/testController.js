import * as testService from '../services/testService.js';

export const createTest = async (req, res) => {
  const { appId, testName, oraclesSelected, notes, dateTime , fileId} = req.body;
  const userId = req.user.id; // Assuming the `authenticateToken` middleware is used and adds `user` to `req`

  try {
    const test = await testService.createTestService({
      appId,
      userId,
      testName,
      oraclesSelected,
      notes,
      dateTime,
      fileId
    });

    res.status(201).json({ success: true, test });
  } catch (error) {
    console.error('[CONTROLLER] Error in createTest:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getTestsByApp = async (req, res) => {
    const { appId } = req.params;
  
    try {
      const tests = await testService.getTestsByAppService(appId);
      res.status(200).json({ success: true, tests });
    } catch (error) {
      console.error('[CONTROLLER] Error in getTestsByApp:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

// Controller for deleting a test
export const deleteTest = async (req, res) => {
    const { testId } = req.params;
  
    try {
      await testService.deleteTestService(testId);
      res.status(200).json({ success: true, message: 'Test deleted successfully' });
    } catch (error) {
      console.error('[CONTROLLER] Error in deleteTest:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  // Update Test Notes
export const updateTestNotes = async (req, res) => {
  const { testId } = req.params;
  const { notes } = req.body;

  try {
    const updatedTest = await testService.updateTestNotesService(testId, notes);
    res.status(200).json({ success: true, test: updatedTest });
  } catch (error) {
    console.error('[CONTROLLER] Error in updateTestNotes:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const downloadTestResult = async (req, res) => {
  try {
      const { testId } = req.params;
      const { file, bucket } = await testService.getTestResultFile(testId);

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

      // Stream file from GridFS
      const downloadStream = bucket.openDownloadStream(file._id);
      downloadStream.pipe(res);

      downloadStream.on('error', () => {
          res.status(500).json({ success: false, message: 'Error downloading file' });
      });

  } catch (error) {
      console.error('[CONTROLLER] Download Test Result Error:', error.message);
      res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadTestInput = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { file, bucket } = await testService.getTestInputFile(fileId);

        // Set headers for downloading the ZIP file
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

        // Stream the file from GridFS to the response
        const downloadStream = bucket.openDownloadStream(file._id);
        downloadStream.pipe(res);

        downloadStream.on('error', () => {
            res.status(500).json({ success: false, message: 'Error downloading input file' });
        });

    } catch (error) {
        console.error('[CONTROLLER] Download Input File Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
