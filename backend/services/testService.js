import mongoose from 'mongoose';
import Test from '../models/testModel.js';
import App from '../models/appModel.js';

export const createTestService = async ({
  appId,
  userId,
  testName,
  oraclesSelected,
  notes,
  dateTime,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert IDs to ObjectId
    const appObjectId = new mongoose.Types.ObjectId(appId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

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

  const tests = await Test.find({ appId: appObjectId });
  if (!tests) throw new Error('No tests found for this app.');
  return tests;
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