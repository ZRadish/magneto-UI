import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Play, Download, Save, Plus, Trash2 } from "lucide-react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import SideBar from "../components/SideBar";
// import axios from "axios";

interface AppTest {
  id: string;
  name: string;
  dateTime: string;
  oracles: {
    language: string;
    theme: string;
    orientation: string;
  };
  notes: string;
  results: string;
}

interface App {
  id: string;
  name: string;
  tests: AppTest[];
}

const AppRow: React.FC<{
  app: App;
  onUpdateNotes: (testId: string, newNotes: string) => void;
}> = ({ app, onUpdateNotes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    type: "notes" | "results";
    testId: string;
  } | null>(null);
  const [editableNotes, setEditableNotes] = useState("");

  const handleDownload = (e: React.MouseEvent, test: AppTest) => {
    e.stopPropagation(); // Prevent triggering other click events
    const element = document.createElement("a");
    const file = new Blob([test.results], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${test.name}-results.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const openModal = (type: "notes" | "results", testId: string) => {
    setActiveModal({ type, testId });
    if (type === "notes") {
      const test = app.tests.find((t) => t.id === testId);
      setEditableNotes(test?.notes || "");
    }
  };

  const handleSaveNotes = () => {
    if (activeModal?.testId) {
      onUpdateNotes(activeModal.testId, editableNotes);
      setActiveModal(null);
    }
  };

  return (
    <div className="border border-violet-900 rounded-lg mb-4 hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50">
      <div
        className="flex items-center p-4 cursor-pointer bg-gray-900"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Folder className="mr-2 text-violet-500" size={20} />
        <span className="flex-grow text-gray-400">{app.name}</span>
        {isExpanded ? (
          <ChevronDown size={20} className="text-violet-500" />
        ) : (
          <ChevronRight size={20} className="text-violet-500" />
        )}
      </div>

      {isExpanded && (
        <div className="p-4 bg-gray-900/50">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="p-2">Test</th>
                <th className="p-2">Date/Time</th>
                <th className="p-2">Oracles</th>
                <th className="p-2">Notes</th>
                <th className="p-2">Results</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {app.tests.map((test) => (
                <tr key={test.id}>
                  <td className="p-2">{test.name}</td>
                  <td className="p-2">{test.dateTime}</td>
                  <td className="p-2">
                    <div className="space-y-1">
                      <div>Language: {test.oracles.language}</div>
                      <div>Theme: {test.oracles.theme}</div>
                      <div>Orientation: {test.oracles.orientation}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <button
                      className="text-violet-500 hover:text-violet-400 transition-colors"
                      onClick={() => openModal("notes", test.id)}
                    >
                      View/Edit Notes
                    </button>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-violet-500 hover:text-violet-400 transition-colors"
                        onClick={() => openModal("results", test.id)}
                      >
                        View Results
                      </button>
                      <button
                        className="text-violet-500 hover:text-violet-400 transition-colors p-1 rounded-full hover:bg-violet-900/20"
                        onClick={(e) => handleDownload(e, test)}
                        title="Download Results"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-violet-900">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
              {activeModal.type === "notes" ? "Notes" : "Results"}
            </h2>
            <div className="max-h-96 overflow-y-auto">
              {activeModal.type === "notes" ? (
                <textarea
                  className="w-full h-64 bg-gray-800 text-gray-300 p-4 rounded-lg border border-violet-900 focus:border-violet-700 focus:outline-none resize-none"
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  placeholder="Enter your notes here..."
                />
              ) : (
                <div className="text-gray-400">
                  {app.tests.find((t) => t.id === activeModal.testId)?.results}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-4">
              {activeModal.type === "notes" && (
                <button
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                  onClick={handleSaveNotes}
                >
                  <Save size={16} />
                  Save Notes
                </button>
              )}
              <button
                className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
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
  // const navigate = useNavigate();
  const [isRunTestModalOpen, setIsRunTestModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [newAppName, setNewAppName] = useState("");

  const handleOpenRunTestModal = () => {
    setIsRunTestModalOpen(true);
  };

  const handleCloseRunTestModal = () => {
    setIsRunTestModalOpen(false);
  };

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
  };

  const handleOpenNewModal = () => {
    setIsNewModalOpen(true); // Open the new modal
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false); // Close the new modal
  };

  const [apps, setApps] = useState<App[]>([
    {
      id: "1",
      name: "App 1",
      tests: [
        {
          id: "1",
          name: "12.zip",
          dateTime: "2024-01-14 10:00",
          oracles: {
            language: "English",
            theme: "Dark",
            orientation: "LTR",
          },
          notes: "Test notes for App 1",
          results: "Test results for App 1",
        },
      ],
    },
    {
      id: "2",
      name: "App 2",
      tests: [
        {
          id: "1",
          name: "13.zip",
          dateTime: "2024-01-14 11:00",
          oracles: {
            language: "French",
            theme: "Light",
            orientation: "RTL",
          },
          notes: "Test notes for App 2",
          results: "Test results for App 2",
        },
      ],
    },
  ]);

  const handleCreateApp = async () => {
    if (!newAppName || !description) {
      return;
    }

    const token = localStorage.getItem("authToken");
    console.log(token);
    try {
      const response = await fetch("http://localhost:5000/api/app", {
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
          tests: [],
        },
      ]);

      setIsNewModalOpen(false);
      setNewAppName("");
      setDescription("");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating app:", error.message);
      } else {
        console.error("Error creating app:", String(error));
      }
      alert("Failed to create app. Please try again.");
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
        `http://localhost:5000/api/apps/${appToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          //body: JSON.stringify({ appToDelete }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete app");
      }

      setApps((prevApps) => prevApps.filter((app) => app.id !== appToDelete));

      setAppToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting app:", error.message);
      } else {
        console.error("Error deleting app:", String(error));
      }
      alert("Failed to delete app. Please try again.");
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

        <div className="space-y-4">
          {apps.map((app) => (
            <AppRow key={app.id} app={app} onUpdateNotes={handleUpdateNotes} />
          ))}
        </div>
        {/* Run Test Modal */}
        {isRunTestModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-violet-900">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Run Test
              </h2>
              <p className="text-gray-400 mb-4">
                Select an app folder to configure and run the test.
              </p>
              {/* New Button */}
              <button
                onClick={handleOpenNewModal}
                className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>New</span>
              </button>

              {/* Render App Folders Dynamically */}
              {/*apps.map((app) => (
        <div key={app.id} className="border border-violet-900 rounded-lg mb-4 hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50">
          <div className="flex items-center p-4 cursor-pointer bg-gray-900">
            <Folder className="mr-2 text-violet-500" size={20} />
            <span className="flex-grow text-gray-400">{app.name}</span>
            <ChevronRight size={20} className="text-violet-500" />
          </div>
        </div>
      ))*/}

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
                      e.stopPropagation(); // Prevent the onClick from being triggered on the folder container
                      handleOpenDeleteModal(app.id);
                    }}
                    className="absolute top-4 right-4 px-3 py-2 bg-red-600 text-white rounded-full hover:opacity-80 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Modal Actions */}
              <div className="mt-4 flex justify-between gap-4">
                <button
                  onClick={handleCloseRunTestModal}
                  className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  disabled={!selectedAppId}
                >
                  Submit
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
