import React, { useEffect, useState } from "react";
import { Play, Plus } from "lucide-react";
import { Folder, ChevronRight } from "lucide-react";
import SideBar from "../components/SideBar";
import AppRow from "./AppRow";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<
    "select-app" | "create-test" | "upload-files"
  >("select-app");
  const [isRunTestModalOpen, setIsRunTestModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [newAppName, setNewAppName] = useState("");

  // Error state for validation
  const [errors, setErrors] = useState<{
    testName?: string;
    oracle?: string;
    app?: string;
  }>({});

  // New state for test creation
  const [testName, setTestName] = useState("");
  const [selectedOracle, setSelectedOracle] = useState<string>("");
  const [testNotes, setTestNotes] = useState("");
  const [createdTestId, setCreatedTestId] = useState<string | null>(null);

  // Existing apps state
  const [apps, setApps] = useState<
    { id: string; name: string; description: string; tests: any[] }[]
  >([]);

  // Oracle options
  const oracleOptions = [
    { id: "Theme Check", name: "Theme Check" },
    { id: "Back Button", name: "Back Button" },
    { id: "Language Detection", name: "Language Detection" },
    { id: "User Input", name: "User Input" },
  ];

  // Fetch user apps when the component mounts
  useEffect(() => {
    const fetchUserApps = async () => {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("UserId");
      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/app/${userId}?nocache=${Date.now()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch apps");
        }

        //const { apps } = await response.json();
        //setApps(apps); // Set apps from the response
        const data = await response.json();
        setApps(
          data.apps.map((app: any) => ({
            id: app._id,
            name: app.appName,
            description: app.description,
            tests: app.tests || [],
          }))
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching apps:", error.message);
          alert("Failed to fetch apps. Please try again.");
        } else {
          console.error("An unknown error occurred:", error);
          alert("Failed to fetch apps. Please try again.");
        }
      }
    };

    fetchUserApps();
  }, []);

  const handleOpenRunTestModal = () => {
    resetModalState(); // Reset all state when opening the modal
    setIsRunTestModalOpen(true);
    // Reset errors when opening the modal
    setErrors({});
  };

  // First, add a function to reset all modal-related state
  const resetModalState = () => {
    setCurrentStep("select-app");
    setSelectedAppId(null);
    resetTestState(); // This already resets test-specific state
    setErrors({});
  };

  // Then modify the modal close function to call this reset
  const handleCloseRunTestModal = () => {
    setIsRunTestModalOpen(false);
    resetModalState();
  };

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    // Don't automatically go to the next step, just select the app
    setErrors({}); // Clear any previous errors
  };

  const resetTestState = () => {
    setTestName("");
    setSelectedOracle("");
    setTestNotes("");
    setCreatedTestId(null);
    setErrors({}); // Clear validation errors
  };

  const resetNewAppModalState = () => {
    setNewAppName("");
    setDescription("");
  };

  const handleOpenNewModal = () => {
    resetNewAppModalState(); // Reset state when opening
    setIsNewModalOpen(true); // Open the new modal
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false); // Close the new modal
    resetNewAppModalState(); // Reset state when opening
  };

  const handleCreateApp = async () => {
    if (!newAppName || !description) {
      return;
    }

    const token = localStorage.getItem("authToken");
    console.log(token);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/app`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add token if needed
        },
        body: JSON.stringify({
          appName: newAppName,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create app");
      }

      const { app } = await response.json();

      // Update local state with the new app
      setApps((prevApps) => [
        ...prevApps,
        {
          id: app._id,
          name: app.appName,
          description: app.description,
          tests: [],
        },
      ]);

      setIsNewModalOpen(false); // Close the modal
      setNewAppName(""); // Reset the input
      setDescription(""); // Reset the description
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching apps:", error.message);
        alert("Failed to fetch apps. Please try again.");
      } else {
        console.error("An unknown error occurred:", error);
        alert("Failed to fetch apps. Please try again.");
      }
    }
  };

  const handleOpenDeleteModal = (appId: string) => {
    setAppToDelete(appId); // Set the app ID to delete
    setIsDeleteModalOpen(true); // Open the delete confirmation modal
  };

  const handleCloseDeleteModal = () => {
    setAppToDelete(null);
    setIsDeleteModalOpen(false); // Close the delete confirmation modal
  };

  const handleDeleteApp = async () => {
    if (!appToDelete) {
      return;
    }

    const userId = localStorage.getItem("UserId");
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Authorization token is missing");
      return;
    }

    console.log("Deleting app with ID:", appToDelete); // Log the app ID
    console.log("user:", userId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/app/${appToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ appToDelete }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete app");
      }

      setApps((prevApps) => prevApps.filter((app) => app.id !== appToDelete));

      setAppToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching apps:", error.message);
        alert("Failed to fetch apps. Please try again.");
      } else {
        console.error("An unknown error occurred:", error);
        alert("Failed to fetch apps. Please try again.");
      }
    }
  };

  const handleUpdateNotes = (testId: string, newNotes: string) => {
    setApps((prevApps) =>
      prevApps.map((app) => ({
        ...app,
        tests: app.tests.map((test) =>
          test.id === testId ? { ...test, notes: newNotes } : test
        ),
      }))
    );
  };

  const handleUpdateAppName = (appId: string, newName: string) => {
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.id === appId ? { ...app, name: newName } : app
      )
    );
  };

  const handleUpdateDescription = (appId: string, newDescription: string) => {
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.id === appId ? { ...app, description: newDescription } : app
      )
    );
  };

  // Validate inputs and set errors
  const validateInputs = () => {
    const newErrors: {
      testName?: string;
      oracle?: string;
      app?: string;
    } = {};

    if (currentStep === "select-app") {
      if (!selectedAppId) {
        newErrors.app = "Please select an app to continue";
        setErrors(newErrors);
        return false;
      }
    } else if (currentStep === "create-test") {
      if (!testName.trim()) {
        newErrors.testName = "Test name is required";
      }
      if (!selectedOracle) {
        newErrors.oracle = "Oracle selection is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleNextStep = async () => {
    if (!validateInputs()) {
      return;
    }

    if (currentStep === "select-app" && selectedAppId) {
      setCurrentStep("create-test");
    } else if (currentStep === "create-test") {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("Authorization token is missing");
        return;
      }

      console.log("the oracle to be put into payload: ", selectedOracle);

      const testPayload = {
        appId: selectedAppId,
        testName: testName,
        oracleSelected: selectedOracle,
        notes: testNotes,
        dateTime: new Date().toISOString(),
        fileId: createdTestId || null,
      };

      console.log("Creating test with payload:", testPayload);

      // Create test API call
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/test`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(testPayload),
        });
        if (!response.ok) {
          throw new Error("Failed to create test");
        }
        const createdTest = await response.json();
        console.log("Test created successfully:", createdTest);
        console.log("Oracle selected: ", createdTest.test.oracleSelected);

        // Optional: Update state or provide user feedback
        setCurrentStep("select-app"); // Return to the previous step
        //alert("Test created successfully!");
        // Extract required data
        localStorage.setItem("test._id", createdTest.test._id);
        console.log(createdTest.test._id);
        const testId = createdTest.test._id;
        const oracleSelection = selectedOracle;
        const appId = selectedAppId;

        navigate(
          `/upload?testId=${testId}&oracleSelected=${oracleSelection}&appId=${appId}`
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error creating test:", error.message);
          alert("Failed to create test. Please try again.");
        } else {
          console.error("An unknown error occurred:", error);
          alert("Failed to create test. Please try again.");
        }
      }

      console.log("create test now");
    }
  };

  const handleBackStep = () => {
    if (currentStep === "create-test") {
      setCurrentStep("select-app");
      setErrors({}); // Clear any validation errors when going back
    }
  };

  const renderModalContent = () => {
    switch (currentStep) {
      case "select-app":
        return (
          <>
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
              Select App
            </h2>
            <p className="text-gray-400 mb-4">
              Select an app folder to configure and run the test.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New</span>
            </button>
            <div
              className="bg-gray-800 p-4 rounded-lg max-h-[60vh] overflow-y-auto mb-6"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleAppSelect(app.id)}
                  className={`relative border border-violet-900 rounded-lg mb-4 cursor-pointer ${
                    selectedAppId === app.id
                      ? "bg-violet-900/50"
                      : "hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50"
                  }`}
                >
                  <div className="flex items-center p-4">
                    <Folder className="mr-2 text-violet-500" size={20} />
                    <span className="flex-grow text-gray-400">{app.name}</span>
                    <ChevronRight size={20} className="text-violet-500" />
                  </div>
                </div>
              ))}
            </div>
            {errors.app && (
              <p className="text-red-500 mb-4 mt-2">{errors.app}</p>
            )}
          </>
        );

      case "create-test":
        return (
          <>
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
              Create Test
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-200 mb-2">Test Name</label>
                <input
                  className={`w-full p-4 bg-gray-800 text-gray-300 border ${
                    errors.testName ? "border-red-500" : "border-violet-900"
                  } rounded-lg focus:outline-none`}
                  placeholder="Enter test name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
                {errors.testName && (
                  <p className="text-red-500 mt-1">{errors.testName}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-200 mb-2">
                  Select Oracle
                </label>
                <select
                  className={`w-full p-4 bg-gray-800 text-gray-300 border ${
                    errors.oracle ? "border-red-500" : "border-violet-900"
                  } rounded-lg focus:outline-none`}
                  value={selectedOracle}
                  onChange={(e) => {
                    console.log("Selected Oracle:", e.target.value);
                    setSelectedOracle(e.target.value);
                  }}
                >
                  <option value="">Select an oracle</option>
                  {oracleOptions.map((oracle) => (
                    <option key={oracle.id} value={oracle.id}>
                      {oracle.name}
                    </option>
                  ))}
                </select>
                {errors.oracle && (
                  <p className="text-red-500 mt-1">{errors.oracle}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-200 mb-2">Notes</label>
                <textarea
                  className="w-full p-4 bg-gray-800 text-gray-300 border border-violet-900 rounded-lg focus:outline-none"
                  placeholder="Add any notes about this test"
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950">
      <SideBar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-2">
              MAGNETO
            </h1>
            <h2 className="text-xl font-semibold text-gray-400">Apps:</h2>
          </div>
          <button
            onClick={handleOpenRunTestModal}
            className="px-6 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Play size={20} />
            <span>Run Test</span>
          </button>
        </div>

        <div
          className="space-y-4 h-[calc(100vh-200px)] overflow-auto bg-gray-800 rounded-lg p-4 shadow-lg"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {apps.map((app) => (
            <div key={app.id}>
              <AppRow
                app={app}
                onUpdateNotes={handleUpdateNotes}
                onUpdateAppName={handleUpdateAppName}
                onUpdateDescription={handleUpdateDescription}
                handleDeleteApp={handleOpenDeleteModal}
              />
            </div>
          ))}
        </div>

        {/* Run Test Modal */}
        {isRunTestModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-violet-900">
              {renderModalContent()}

              {/* Modal Actions */}
              <div className="mt-4 flex justify-between gap-4">
                {currentStep === "create-test" ? (
                  <button
                    onClick={handleBackStep}
                    className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    onClick={handleCloseRunTestModal}
                    className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                )}

                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-violet-900">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Confirm Deletion
              </h2>
              <p className="text-gray-200 mb-4">
                Are you sure you want to delete this app folder?
              </p>

              {/* Modal Actions */}
              <div className="mt-4 flex justify-between gap-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApp}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Modal */}
        {isNewModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-violet-900">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                New App Folder
              </h2>
              <p className="text-gray-200 mb-4">Create a new app folder</p>

              {/* Input for the new folder */}
              <input
                className="w-full p-4 bg-gray-800 text-gray-300 border border-violet-900 rounded-lg focus:outline-none"
                placeholder="Enter new app folder name"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
              />

              {/* Description Field */}
              <p className="text-gray-200 mt-4 mb-2">Description</p>
              <input
                className="w-full p-4 bg-gray-800 text-gray-300 border border-violet-900 rounded-lg focus:outline-none"
                placeholder="Enter a brief description of the app (max 50 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={50}
              />
              <p className="text-gray-400 text-sm mt-1">
                {description.length}/50 characters used
              </p>

              {/* Modal Actions */}
              <div className="mt-4 flex justify-between gap-4">
                <button
                  onClick={handleCloseNewModal}
                  className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
                <button
                  onClick={handleCreateApp}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  disabled={!newAppName || !description} // Disable if any of the fields is empty
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
