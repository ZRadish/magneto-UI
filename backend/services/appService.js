import mongoose from 'mongoose';
import App from '../models/appModel.js';
import User from '../models/userModel.js';

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
  
      // Remove the app from the user's apps array
      await User.findByIdAndUpdate(
        userObjectId,
        { $pull: { apps: appObjectId } },
        { session }
      );
  
      // Delete the app from the Apps collection
      const deletedApp = await App.findByIdAndDelete(appObjectId, { session });
      console.log("[DEBUG] App Delete Result:", deletedApp);
  
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

export const updateAppNameService = async (appId, userId, newAppName) => {
  try {
    const appObjectId = new mongoose.Types.ObjectId(appId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the app and check if the user owns it
    const app = await App.findOne({ _id: appObjectId, userId: userObjectId });

    if (!app) {
      throw new Error("App not found or not owned by this user.");
    }

    // Update the app name
    const updatedApp = await App.findByIdAndUpdate(
      appObjectId,
      { $set: { appName: newAppName } },
      { new: true, runValidators: true }
    );

    if (!updatedApp) {
      throw new Error("Failed to update app name.");
    }

    return updatedApp;
  } catch (error) {
    throw new Error("Error updating app name: " + error.message);
  }
};

export const updateAppDescriptionService = async (appId, userId, newDescription) => {
  try {
    const appObjectId = new mongoose.Types.ObjectId(appId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the app and verify if the user owns it
    const app = await App.findOne({ _id: appObjectId, userId: userObjectId });

    if (!app) {
      throw new Error("App not found or not owned by this user.");
    }

    // Update the description
    const updatedApp = await App.findByIdAndUpdate(
      appObjectId,
      { $set: { description: newDescription } },
      { new: true, runValidators: true }
    );

    if (!updatedApp) {
      throw new Error("Failed to update app description.");
    }

    return updatedApp;
  } catch (error) {
    throw new Error("Error updating app description: " + error.message);
  }
};
