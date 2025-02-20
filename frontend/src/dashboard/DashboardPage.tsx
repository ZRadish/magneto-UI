import React, { useEffect, useState, useRef } from "react";
import { Play, Download, Save, Plus, Trash2, Edit } from "lucide-react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";

interface AppTest {
  _id: string;
  appId: string;
  userId: string;
  testName: string;
  oracleSelected: string;
  fileId: string;
  status: "completed" | "pending";
  result: string;
  notes: string;
  createdAt: string;
  fileName?: string; // From the API join
}

interface App {
  id: string;
  name: string;
  description: string;
  tests: AppTest[];
}

const AppRow: React.FC<{
  app: App;
  onUpdateNotes: (testId: string, newNotes: string) => void;
  onUpdateAppName: (appId: string, newName: string) => void;
  onUpdateDescription: (appId: string, newDescription: string) => void;
}> = ({ app, onUpdateNotes, onUpdateAppName, onUpdateDescription }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newAppName, setNewAppName] = useState(app.name);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    type: "notes" | "results";
    testId: string;
  } | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [tests, setTests] = useState<AppTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string>("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState(app.description);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      appNameInputRef.current?.focus(); // Auto-focus input after enabling edit mode
    }, 0);
  };
  const appNameInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const fetchTests = async () => {
      if (!isExpanded) return;

      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Authentication token not found");
        setIsLoading(false);
        return;
      }

      try {
        const url = `${import.meta.env.VITE_API_URL}/test/${
          app.id
        }?nocache=${Date.now()}`;

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch tests: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data:", data);
        // Map the API response to match our interface
        const mappedTests = data.tests.map((test: any) => ({
          _id: test._id,
          appId: test.appId,
          testName: test.testName || "Untitled Test",
          oracleSelected: test.oracleSelected || "",
          fileId: test.fileId || null,
          status: test.status || "Pending",
          result: test.result || "Not available",
          notes: test.notes || "No notes",
          createdAt: test.createdAt || new Date().toISOString(),
          fileName: test.fileName || "no file",
        }));
        console.log(mappedTests);

        setTests(mappedTests);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching tests:", error.message);
          setError("No tests available.");
          setTests([]);
        } else {
          console.error("An unknown error occurred:", error);
          setError("An unknown error occurred while fetching tests.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [app.id, isExpanded]);

  const handleFileDownload = async (e: React.MouseEvent, test: AppTest) => {
    e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found");
      return;
    }
    if (!test.fileId) {
      alert("No file available for download");
      return;
    }
    try {
      // Create a temporary anchor element for the download
      const a = document.createElement("a");
      // Set the href to the file download endpoint
      a.href = `${import.meta.env.VITE_API_URL}/files/${test.fileId}`;
      // Add the auth token to the href
      if (token) {
        a.href += `?token=${token}`;
      }
      // Set download attribute (optional filename)
      if (test.fileName) {
        a.download = test.fileName;
      }
      // Hide the anchor
      a.style.display = "none";
      // Add to document
      document.body.appendChild(a);
      // Trigger click
      a.click();
      // Cleanup
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error initiating download:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleResultsDownload = async (e: React.MouseEvent, test: AppTest) => {
    e.stopPropagation();
    if (!test.result) {
      alert("No results available for download");
      return;
    }

    try {
      const blob = new Blob([test.result], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${test.testName}-results.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading results:", err);
      alert(err instanceof Error ? err.message : "Failed to download results");
    }
  };

  const openModal = async (type: "notes" | "results", testId: string) => {
    setActiveModal({ type, testId });
    const test = tests.find((t) => t._id === testId);

    if (type === "notes") {
      setEditableNotes(test?.notes || "");
    } else if (type === "results") {
      setModalContent(test?.result || "No results available");
    }
  };

  const handleSaveNotes = async () => {
    if (!activeModal?.testId) return;
  
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found");
      return;
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/test/${activeModal.testId}/notes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: editableNotes }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to update notes: ${response.status}`);
      }
  
      const updatedTest = await response.json();
  
      onUpdateNotes(activeModal.testId, updatedTest.test.notes);
  
      setActiveModal(null); // Close modal
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("Failed to update notes. Please try again.");
    }
  };  
  
  const handleSaveAppName = async () => {
    if (!newAppName.trim()) {
      alert("App name cannot be empty.");
      return;
    }
  
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found.");
      return;
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/app/${app.id}/name`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ appName: newAppName }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to update app name: ${response.status}`);
      }
  
      const updatedApp = await response.json();
      onUpdateAppName(app.id, updatedApp.app.appName);
      setIsEditing(false); // Exit edit mode after saving
    } catch (error) {
      console.error("Error updating app name:", error);
      alert("Failed to update app name. Please try again.");
    }
  };

  const handleEditDescription = () => {
    setIsEditingDescription(true);
    setTimeout(() => {
      descriptionInputRef.current?.focus(); // Auto-focus input after state updates
    }, 0);
  };

  const handleSaveDescription = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/app/${app.id}/description`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: newDescription.trim() }), // Allow empty string
      });

      if (!response.ok) {
        throw new Error(`Failed to update app description: ${response.status}`);
      }

      const updatedApp = await response.json();
      onUpdateDescription(app.id, updatedApp.app.description || ""); // Ensure empty string is saved

      setIsEditingDescription(false);
    } catch (error) {
      console.error("Error updating app description:", error);
      alert("Failed to update app description. Please provide a non-empty description of the app.");
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token not found");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/test/${testId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete test: ${response.status}`);
        }

        // Remove the deleted test from the local state
        setTests((prevTests) =>
          prevTests.filter((test) => test._id !== testId)
        );
      } catch (error) {
        console.error("Error deleting test:", error);
        alert("Failed to delete the test. Please try again.");
      }
    }
  };

  return (
    <div className="border border-violet-900 rounded-lg mb-4 hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50">
      <div className="flex items-center p-4 cursor-pointer bg-gray-900" onClick={() => setIsExpanded(!isExpanded)}>
          <Folder className="mr-2 text-violet-500" size={20} />

          {/* Editable App Name */}
          {isEditing ? (
            <input
              ref={appNameInputRef} // Auto-focus when editing
              type="text"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent toggling expansion while editing
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveAppName(); // Save on Enter key
                }
              }}
              className="flex-grow text-gray-400 bg-gray-800 border border-violet-700 rounded px-2 py-1 focus:outline-none"
            />
          ) : (
            <span className="flex-grow text-gray-400">{app.name}</span>
          )}

          {/* Edit & Save Buttons */}
          {isEditing ? (
            <button onClick={(e) => { e.stopPropagation(); handleSaveAppName(); }} className="ml-2 text-green-500 hover:text-green-400">
              <Save size={20} />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); handleEditClick(); }} className="ml-2 text-violet-500 hover:text-violet-400">
              <Edit size={20} />
            </button>
          )}

          {isExpanded ? (
            <ChevronDown size={20} className="text-violet-500" />
          ) : (
            <ChevronRight size={20} className="text-violet-500" />
          )}
      </div>


      {isExpanded && (
        <div className="p-4 bg-gray-900/50">
          <div className="text-gray-400 mb-4 border border-gray-700 rounded-lg p-3">
            {isEditingDescription ? (
              <input
                ref={descriptionInputRef}
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={handleSaveDescription} // Save when the input loses focus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveDescription(); // Save on Enter key
                }}
                className="w-full text-gray-400 bg-gray-800 border border-violet-700 rounded px-2 py-1 focus:outline-none"
              />
            ) : (
              <p onClick={handleEditDescription} className="cursor-pointer text-gray-400">
                {app.description}
              </p>
            )}
          </div>

          {isLoading && (
            <div className="text-gray-400 text-center py-6">
              Loading tests...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-6">{error}</div>
          )}

          {!isLoading && !error && tests.length === 0 && (
            <div className="text-gray-400 text-center py-6">
              No tests found for this app
            </div>
          )}

          {!isLoading && !error && tests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="p-3">Test Name</th>
                    <th className="p-3">File</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Oracles Selected</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3">Results</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {tests.map((test) => (
                    <tr key={test._id}>
                      <td className="p-3">{test.testName}</td>
                      <td className="p-3">
                        {test.fileId ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {test.fileName}
                            </span>
                            <button
                              className="text-violet-500 hover:text-violet-400 transition-colors p-1 rounded-full hover:bg-violet-900/20"
                              onClick={(e) => handleFileDownload(e, test)}
                              title="Download File"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">No file</span>
                        )}
                      </td>
                      <td className="p-3">
                        {new Date(test.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs ${
                            test.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {test.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1.5">
                          {test.oracleSelected &&
                            (() => {
                              const colorClass =
                                {
                                  "Theme Check":
                                    "bg-green-900/20 text-center text-green-400",
                                  "Back Button":
                                    "bg-blue-900/20 text-center text-blue-400",
                                  "Language Detection":
                                    "bg-pink-900/20 text-center text-pink-400",
                                  "User Input":
                                    "bg-yellow-900/20 text-center text-yellow-400",
                                }[test.oracleSelected] ||
                                "bg-violet-900/20 text-violet-400";

                              return (
                                <span
                                  className={`px-3 py-1.5 ${colorClass} rounded-full text-xs w-44`}
                                >
                                  {test.oracleSelected}
                                </span>
                              );
                            })()}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          className="text-violet-500 hover:text-violet-400 transition-colors"
                          onClick={() => openModal("notes", test._id)}
                        >
                          {test.notes ? "View/Edit" : "Add Notes"}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-violet-500 hover:text-violet-400 transition-colors"
                            onClick={() => openModal("results", test._id)}
                          >
                            View
                          </button>
                          {test.result && (
                            <button
                              className="text-violet-500 hover:text-violet-400 transition-colors p-1 rounded-full hover:bg-violet-900/20"
                              onClick={(e) => handleResultsDownload(e, test)}
                              title="Download Results"
                            >
                              <Download size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-full"
                          onClick={() => handleDeleteTest(test._id)}
                          title="Delete Test"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>{" "}
                      {/* Add the delete button here */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl max-w-2xl w-full border border-violet-900">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
              {activeModal.type === "notes" ? "Notes" : "Results"}
            </h2>
            <div className="max-h-96 overflow-y-auto">
              {activeModal.type === "notes" ? (
                <textarea
                  className="w-full h-64 bg-gray-800 text-gray-300 p-6 rounded-xl border border-violet-900 focus:border-violet-700 focus:outline-none resize-none"
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  placeholder="Enter your notes here..."
                />
              ) : (
                <pre className="text-gray-400 whitespace-pre-wrap p-6 bg-gray-800 rounded-xl">
                  {modalContent}
                </pre>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              {activeModal.type === "notes" && (
                <button
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                  onClick={handleSaveNotes}
                >
                  <Save size={16} />
                  Save Notes
                </button>
              )}
              <button
                className="px-6 py-3 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-xl hover:opacity-90 transition-opacity"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
    setIsRunTestModalOpen(true);
  };

  const handleCloseRunTestModal = () => {
    setIsRunTestModalOpen(false);
  };

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    resetTestState(); // Clear all test-related state
    setCurrentStep("create-test");
  };
  const resetTestState = () => {
    setTestName("");
    setSelectedOracle("");
    setTestNotes("");
    setCreatedTestId(null);
  };

  const handleOpenNewModal = () => {
    setIsNewModalOpen(true); // Open the new modal
    resetTestState();
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false); // Close the new modal
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
      prevApps.map((app) => (app.id === appId ? { ...app, name: newName } : app))
    );
  };

  const handleUpdateDescription = (appId: string, newDescription: string) => {
    setApps((prevApps) =>
      prevApps.map((app) => (app.id === appId ? { ...app, description: newDescription } : app))
    );
  };  

  const handleNextStep = async () => {
    if (currentStep === "select-app" && selectedAppId) {
      setCurrentStep("create-test");
    } else if (currentStep === "create-test") {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("Authorization token is missing");
        return;
      }

      if (!testName || !selectedOracle) {
        alert("Please provide a Test Name and select an Oracle.");
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteModal(app.id);
                    }}
                    className="absolute top-4 right-4 px-3 py-2 bg-red-600 text-white rounded-full hover:opacity-80 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
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
                  className="w-full p-4 bg-gray-800 text-gray-300 border border-violet-900 rounded-lg focus:outline-none"
                  placeholder="Enter test name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-200 mb-2">Oracle type</label>
                <select
                  className="w-full p-4 bg-gray-800 text-gray-300 border border-violet-900 rounded-lg focus:outline-none"
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
              <AppRow app={app} onUpdateNotes={handleUpdateNotes} onUpdateAppName={handleUpdateAppName} onUpdateDescription={handleUpdateDescription} />
            </div>
          ))}
        </div>

        {/* Run Test Modal */}
        {/* Updated Modal */}
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
                    onClick={() => setIsRunTestModalOpen(false)}
                    className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                )}

                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  disabled={
                    (currentStep === "select-app" && !selectedAppId) ||
                    (currentStep === "create-test" &&
                      (!testName || !selectedOracle))
                  }
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