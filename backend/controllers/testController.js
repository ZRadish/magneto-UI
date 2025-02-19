import * as testService from '../services/testService.js';

export const createTest = async (req, res) => {
  const { appId, testName, oracleSelected, notes, dateTime , fileId} = req.body;
  const userId = req.user.id; // Assuming the `authenticateToken` middleware is used and adds `user` to `req`

  try {
    const test = await testService.createTestService({
      appId,
      userId,
      testName,
      oracleSelected,
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
