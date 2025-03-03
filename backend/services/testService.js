import mongoose from 'mongoose';
import Test from '../models/testModel.js';
import App from '../models/appModel.js';
import { GridFSBucket } from 'mongodb';

export const createTestService = async ({
  appId,
  userId,
  testName,
  oraclesSelected,
  notes,
  dateTime,
  fileId,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert IDs to ObjectId
    const appObjectId = new mongoose.Types.ObjectId(appId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const fileObjectId = new mongoose.Types.ObjectId(fileId);

    // Create the test
    const newTest = await Test.create(
      [
        {
          appId: appObjectId,
          userId: userObjectId,
          testName,
          oraclesSelected,
          notes,
          dateTime,
          fileId: fileObjectId, // Include fileId
          createdAt: new Date(),
          status: 'pending', // Default status
          result: '', // Default result
        },
      ],
      { session }
    );

    // Add the test to the App's tests array
    await App.findByIdAndUpdate(
      appObjectId,
      { $push: { tests: newTest[0]._id } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return newTest[0]; // Return the created test
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error('Failed to create test: ' + error.message);
  }
};

export const getTestsByAppService = async (appId) => {
    const appObjectId = new mongoose.Types.ObjectId(appId);
  
    // Fetch all tests for the app
    const tests = await Test.find({ appId: appObjectId });
    if (!tests || tests.length === 0) throw new Error('No tests found for this app.');
  
    // Fetch filenames for associated fileIds
    const testsWithFileNames = await Promise.all(
      tests.map(async (test) => {
        if (test.fileId) {
          try {
            // Query files.files collection to get the filename
            const file = await mongoose.connection.db.collection('files.files').findOne({
              _id: new mongoose.Types.ObjectId(test.fileId),
            });
            const fileName = file ? file.filename : 'Unknown';
            return { ...test.toObject(), fileName };
          } catch (error) {
            console.error(`Error fetching file name for test ${test._id}: ${error.message}`);
            return { ...test.toObject(), fileName: 'Unknown' };
          }
        }
        return { ...test.toObject(), fileName: null }; // No file associated
      })
    );
  
    return testsWithFileNames;
  };
  

export const deleteTestService = async (testId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      // Convert testId to ObjectId
      const testObjectId = new mongoose.Types.ObjectId(testId);
  
      // Find the test in the Tests collection
      const test = await Test.findById(testObjectId).session(session);
      if (!test) {
        throw new Error('Test not found');
      }
  
      const { appId } = test;
  
      // Delete the test from the Tests collection
      await Test.findByIdAndDelete(testObjectId).session(session);
  
      // Remove the test from the tests array in the associated app
      await App.findByIdAndUpdate(
        appId,
        { $pull: { tests: testObjectId } },
        { new: true, session }
      );
  
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error('Failed to delete test: ' + error.message);
    }
  };

  export const updateTestNotesService = async (testId, notes) => {
    try {
      const testObjectId = new mongoose.Types.ObjectId(testId);
  
      const updatedTest = await Test.findByIdAndUpdate(
        testObjectId,
        { $set: { notes } },
        { new: true, runValidators: true }
      );
  
      if (!updatedTest) {
        throw new Error('Test not found');
      }
  
      return updatedTest;
    } catch (error) {
      throw new Error('Failed to update test notes: ' + error.message);
    }
  };

export const getTestResultFile = async (testId) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'results' });

        // Find the latest file associated with the test
        const fileDoc = await db.collection('results.files')
            .find({ 'metadata.testId': new mongoose.Types.ObjectId(testId) })
            .sort({ uploadDate: -1 })
            .limit(1)
            .toArray();

        if (!fileDoc.length) {
            throw new Error('File not found');
        }

        return {
            file: fileDoc[0],
            bucket
        };
    } catch (error) {
        console.error('[SERVICE] Error retrieving test result file:', error.message);
        throw new Error('Failed to retrieve test result file');
    }
};
