import * as appService from '../services/appService.js';

// Controller for creating a new app
export const createApp = async (req, res) => {
  const { appName, description } = req.body;
  const userId = req.user.id; // Assuming `authenticateToken` adds `user` to `req`

  try {
    const app = await appService.createAppService(userId, appName, description);
    res.status(201).json({ success: true, app });
  } catch (error) {
    console.error("[CONTROLLER] Error in createApp:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Controller for fetching apps for a user
export const getUserApps = async (req, res) => {
  const { userId } = req.params;

  try {
    const apps = await appService.getUserAppsService(userId);
    res.status(200).json({ success: true, apps });
  } catch (error) {
    console.error("[CONTROLLER] Error in getUserApps:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Controller for deleting an app
export const deleteApp = async (req, res) => {
    console.log("[BACKEND] DELETE /app/:appId endpoint hit");
  
    // Retrieve appId from params and userId from authenticated request
    const { appId } = req.params;
    const userId = req.user.id;
  
    console.log("[BACKEND] App ID:", appId);
    console.log("[BACKEND] User ID:", userId);
  
    try {
      const result = await appService.deleteAppService(appId, userId); // Pass both appId and userId
      res.status(200).json({ success: true, app: result });
    } catch (error) {
      console.error("[CONTROLLER] Error in deleteApp:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
// Controller for updating an app's name
export const updateAppName = async (req, res) => {
    const { appId } = req.params;
    const { appName } = req.body;
    const userId = req.user.id; // Extract userId from authentication middleware
  
    if (!appName || appName.trim() === "") {
      return res.status(400).json({ success: false, error: "App name cannot be empty" });
    }
  
    try {
      const updatedApp = await appService.updateAppNameService(appId, userId, appName.trim());
      res.status(200).json({ success: true, app: updatedApp });
    } catch (error) {
      console.error("[CONTROLLER] Error in updateAppName:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
};
  
  // Controller for updating an app's description
export const updateAppDescription = async (req, res) => {
  const { appId } = req.params;
  const { description } = req.body;
  const userId = req.user.id; // Extract userId from authentication middleware

  if (!description || description.trim() === "") {
    return res.status(400).json({ success: false, error: "Description cannot be empty" });
  }

  try {
    const updatedApp = await appService.updateAppDescriptionService(appId, userId, description.trim());
    res.status(200).json({ success: true, app: updatedApp });
  } catch (error) {
    console.error("[CONTROLLER] Error in updateAppDescription:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
