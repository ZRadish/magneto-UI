import mongoose from 'mongoose';
import App from '../models/appModel.js';
import User from '../models/userModel.js';
import Test from '../models/testModel.js';

export const createAppService = async (userId, appName, description) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Convert userId from string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log("Creating app with data:", {
        userId: userObjectId,
        appName,
        description,
        createdAt: new Date(),
        tests: [],
      });
      

    // Create the app
    const newApp = await App.create(
      [
        {
          userId: userObjectId, // Use the converted ObjectId
          appName: appName.trim(),
          description: description.trim(),
          createdAt: new Date(),
          tests: [], // Initialize empty tests array
        },
      ],
      { session }
    );
    

    // Update the user's apps array
    await User.findByIdAndUpdate(
      userObjectId, // Use the converted ObjectId
      { $push: { apps: newApp[0]._id } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return newApp[0]; // Return the created app
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Failed to create app: " + error.message);
  }
};


// Service for fetching apps for a user
export const getUserAppsService = async (userId) => {
  const apps = await App.find({ userId });
  if (!apps) throw new Error("No apps found for this user.");
  return apps;
};


// Service for deleting an app
export const deleteAppService = async (appId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appObjectId = new mongoose.Types.ObjectId(appId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log("[DEBUG] Converted appId to ObjectId:", appObjectId);
    console.log("[DEBUG] Converted userId to ObjectId:", userObjectId);

    // Find the app and verify ownership
    const app = await App.findOne({ _id: appObjectId, userId: userObjectId }).session(session);

    console.log("[DEBUG] App Query Result:", app);

    if (!app) {
      throw new Error("App not found or not owned by this user.");
    }

    // Find all tests associated with this app
    const tests = await Test.find({ appId: appObjectId }).session(session);

    // Extract file IDs from the tests
    const fileIds = tests
      .filter(test => test.fileId) // Only keep tests that have an associated file
      .map(test => new mongoose.Types.ObjectId(test.fileId)); // Convert fileId to ObjectId

    console.log(`[DEBUG] Deleting ${tests.length} tests and ${fileIds.length} associated files.`);

    // Delete all tests associated with this app
    await Test.deleteMany({ appId: appObjectId }).session(session);

    // Remove the app from the user's apps array
    await User.findByIdAndUpdate(
      userObjectId,
      { $pull: { apps: appObjectId } },
      { session }
    );

    // Delete the app from the Apps collection
    const deletedApp = await App.findByIdAndDelete(appObjectId, { session });
    console.log("[DEBUG] App Delete Result:", deletedApp);

    // Delete associated files from GridFS (files.files and files.chunks)
    if (fileIds.length > 0) {
      try {
        await mongoose.connection.db.collection('files.files').deleteMany({ _id: { $in: fileIds } });
        await mongoose.connection.db.collection('files.chunks').deleteMany({ files_id: { $in: fileIds } });
        console.log(`[DEBUG] Deleted associated files: ${fileIds}`);
      } catch (error) {
        console.error(`[ERROR] Failed to delete associated files for app ${appId}: ${error.message}`);
      }
    }

    await session.commitTransaction();
    session.endSession();

    return deletedApp;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("[SERVICE] Error in deleteAppService:", error.message);
    throw new Error(error.message);
  }
};
