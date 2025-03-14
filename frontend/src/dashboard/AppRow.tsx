import React, { useEffect, useState, useRef } from "react";
import { Download, Save, Trash2, Edit } from "lucide-react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";

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
  handleDeleteApp: (appId: string) => void;
  expandApp?: boolean;
  testIdToHighlight?: string;
}> = ({
  app,
  onUpdateNotes,
  onUpdateAppName,
  onUpdateDescription,
  handleDeleteApp,
  expandApp = false,
  testIdToHighlight,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newAppName, setNewAppName] = useState(app.name);
  const [isExpanded, setIsExpanded] = useState(expandApp);
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

  const [testProgress, setTestProgress] = useState<{ [key: string]: number }>(
    () => JSON.parse(localStorage.getItem("testProgress") || "{}")
  );
  const progressIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [completedTests, setCompletedTests] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("completedTests");
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  });

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

  useEffect(() => {
    if (expandApp) {
      setIsExpanded(true);
    }
  }, [expandApp]);

  useEffect(() => {
    if (
      testIdToHighlight &&
      tests.some((test) => test._id === testIdToHighlight) &&
      !completedTests.has(testIdToHighlight)
    ) {
      const highlightedTest = tests.find(
        (test) => test._id === testIdToHighlight
      );

      // Set up progress tracking if the test exists
      if (highlightedTest) {
        // Clear any existing interval for this test
        if (progressIntervals.current[testIdToHighlight]) {
          clearInterval(progressIntervals.current[testIdToHighlight]);
        }

        // Start at 0 progress
        setTestProgress((prev) => ({ ...prev, [testIdToHighlight]: 0 }));

        // Set up the progress interval - update every 300ms for 30 seconds total
        const interval = setInterval(() => {
          setTestProgress((prev) => {
            const currentProgress = prev[testIdToHighlight] || 0;
            const newProgress = currentProgress + 100 / 100; // 100 steps to reach 100%

            // If we've reached 100%, clear the interval and mark as completed
            if (newProgress >= 100) {
              clearInterval(progressIntervals.current[testIdToHighlight]);

              // Update the test status to completed
              setTests((prevTests) =>
                prevTests.map((test) =>
                  test._id === testIdToHighlight
                    ? { ...test, status: "completed" }
                    : test
                )
              );

              // Mark this test as completed and save to localStorage
              const newCompleted = new Set(completedTests);
              newCompleted.add(testIdToHighlight);
              setCompletedTests(newCompleted);
              localStorage.setItem(
                "completedTests",
                JSON.stringify([...newCompleted])
              );

              return { ...prev, [testIdToHighlight]: 100 };
            }
            return { ...prev, [testIdToHighlight]: newProgress };
          });
        }, 300); // 300ms * 100 steps = 30 seconds

        // Store the interval reference
        progressIntervals.current[testIdToHighlight] = interval;

        // Clean up interval on unmount
        return () => clearInterval(interval);
      }
    }
  }, [testIdToHighlight, tests, completedTests]);

  const isHighlightedTest = (testId: string) => {
    return testId === testIdToHighlight && !completedTests.has(testId);
  };

  // const handleFileDownload = async (e: React.MouseEvent, test: AppTest) => {
  //   e.stopPropagation();
  //   const token = localStorage.getItem("authToken");
  //   if (!token) {
  //     alert("Authentication token not found");
  //     return;
  //   }
  //   if (!test.fileId) {
  //     alert("No file available for download");
  //     return;
  //   }
  //   try {
  //     // Create a temporary anchor element for the download
  //     const a = document.createElement("a");
  //     // Set the href to the file download endpoint
  //     a.href = `${import.meta.env.VITE_API_URL}/files/${test.fileId}`;
  //     // Add the auth token to the href
  //     if (token) {
  //       a.href += `?token=${token}`;
  //     }
  //     // Set download attribute (optional filename)
  //     if (test.fileName) {
  //       a.download = test.fileName;
  //     }
  //     // Hide the anchor
  //     a.style.display = "none";
  //     // Add to document
  //     document.body.appendChild(a);
  //     // Trigger click
  //     a.click();
  //     // Cleanup
  //     document.body.removeChild(a);
  //   } catch (err) {
  //     console.error("Error initiating download:", err);
  //     alert("Failed to download file. Please try again.");
  //   }
  // };

  const handleInputFileDownload = async (
    e: React.MouseEvent,
    test: AppTest
  ) => {
    e.stopPropagation(); // Prevent row click event

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found");
      return;
    }

    if (!test.fileId) {
      alert("No input file available for download");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/test/input_download/${test.fileId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download input file.");
      }

      // Convert response to Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = test.fileName || "input_file.zip"; // Set filename
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading input file:", error);
      alert("Failed to download input file. Please try again.");
    }
  };

  const handleResultsDownload = async (e: React.MouseEvent, test: AppTest) => {
    e.stopPropagation();

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/test/result_download/${test._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download results.");
      }

      // Create a Blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${test.testName}-results.pdf`; // Set filename
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading results:", error);
      alert("Failed to download results. Please try again.");
    }
  };

  const openModal = async (type: "notes" | "results", testId: string) => {
    setActiveModal({ type, testId });

    if (type === "notes") {
      const test = tests.find((t) => t._id === testId);
      setEditableNotes(test?.notes || "");
    } else if (type === "results") {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication token not found");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/test/result_download/${testId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch PDF.");
        }

        // Convert response to Blob and create a URL
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);

        // Set modal content as the PDF URL
        setModalContent(pdfUrl);
      } catch (error) {
        console.error("Error fetching PDF:", error);
        alert("Failed to load PDF. Please try again.");
      }
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/app/${app.id}/description`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ description: newDescription.trim() }), // Allow empty string
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update app description: ${response.status}`);
      }

      const updatedApp = await response.json();
      onUpdateDescription(app.id, updatedApp.app.description || ""); // Ensure empty string is saved

      setIsEditingDescription(false);
    } catch (error) {
      console.error("Error updating app description:", error);
      alert(
        "Failed to update app description. Please provide a non-empty description of the app."
      );
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

  function handleOpenDeleteModal(id: string) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="border border-violet-900 rounded-2xl mb-6 hover:border-violet-700 transition-colors hover:shadow-xl hover:shadow-violet-900/50">
      <div
        className="flex items-center p-6 cursor-pointer bg-gray-900 rounded-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Folder className="mr-4 text-violet-500" size={24} />

        {/* Editable App Name with larger text */}
        {isEditing ? (
          <input
            ref={appNameInputRef}
            type="text"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveAppName();
              }
            }}
            className="flex-grow text-lg text-gray-400 bg-gray-800 border border-violet-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        ) : (
          <span className="flex-grow text-lg text-gray-400">{app.name}</span>
        )}

        {/* Edit & Save Buttons with larger icons */}
        {isEditing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveAppName();
            }}
            className="ml-4 text-green-500 hover:text-green-400"
          >
            <Save size={24} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
            className="ml-4 text-violet-500 hover:text-violet-400"
          >
            <Edit size={24} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteApp(app.id); // Pass app ID to open delete modal
          }}
          className="ml-4 text-red-500 hover:text-red-400"
        >
          <Trash2 size={24} />
        </button>

        {isExpanded ? (
          <ChevronDown size={24} className="text-violet-500 ml-4" />
        ) : (
          <ChevronRight size={24} className="text-violet-500 ml-4" />
        )}
      </div>

      {isExpanded && (
        <div className="p-6 bg-gray-900/50 rounded-b-2xl">
          {/* Description with larger text and rounded input */}
          <div className="text-gray-400 mb-6 border border-gray-700 rounded-2xl p-4">
            {isEditingDescription ? (
              <input
                ref={descriptionInputRef}
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveDescription();
                }}
                className="w-full text-lg text-gray-400 bg-gray-800 border border-violet-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            ) : (
              <p
                onClick={handleEditDescription}
                className="cursor-pointer text-lg text-gray-400"
              >
                {app.description}
              </p>
            )}
          </div>

          {/* Test Table with Rounded Rows */}
          {!isLoading && !error && tests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="p-4">Test Name</th>
                    <th className="p-4">File</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Oracles</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4">Results</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {tests.map((test, index) => (
                    <tr
                      key={test._id}
                      className={`hover:bg-gray-800/50 transition-colors ${
                        isHighlightedTest(test._id)
                          ? ""
                          : index === 0
                          ? "first-test-row"
                          : ""
                      }`}
                      style={{ overflow: "hidden", borderRadius: "24px" }}
                    >
                      {test.status === "pending" &&
                      isHighlightedTest(test._id) ? (
                        // Pending test row with progress bar (exactly as your example)
                        <td colSpan={8} className="p-4">
                          <div
                            className="bg-violet-900/20 border-2 border-violet-500 rounded-3xl p-4"
                            style={{ overflow: "hidden" }} // Keeps content inside rounded borders
                          >
                            <div className="flex items-center space-x-4 test-progress-bar">
                              <span className="text-yellow-600 w-1/4">
                                {test.testName}
                              </span>
                              <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-yellow-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${testProgress[test._id] || 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-gray-400 w-1/12">
                                {Math.round(testProgress[test._id] || 0)}%
                              </span>
                            </div>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="p-3 text-base">{test.testName}</td>
                          <td className="p-3">
                            {test.fileId ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">
                                  {test.fileName}
                                </span>
                                <button
                                  className="text-violet-500 hover:text-violet-400 transition-colors p-1 rounded-full hover:bg-violet-900/20"
                                  onClick={(e) =>
                                    handleInputFileDownload(e, test)
                                  }
                                  title="Download File"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-red-500">
                                No file
                              </span>
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
                                        "bg-orange-900/20 text-center text-orange-400",
                                      "Back Button":
                                        "bg-blue-900/20 text-center text-blue-400",
                                      "Language Detection":
                                        "bg-pink-900/20 text-center text-pink-400",
                                      "User Input":
                                        "bg-yellow-900/20 text-center text-yellow-400",
                                    }[test.oracleSelected] ||
                                    "bg-violet-900/20 text-center text-violet-400";

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
                                  onClick={(e) =>
                                    handleResultsDownload(e, test)
                                  }
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
                        </>
                      )}
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
          <div className="bg-gray-900 p-8 rounded-2xl max-w-2xl w-full border border-violet-900">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
              {activeModal.type === "notes" ? "Notes" : "Results"}
            </h2>

            <div className="max-h-[80vh] overflow-y-auto">
              {activeModal.type === "notes" ? (
                <textarea
                  className="w-full h-64 bg-gray-800 text-gray-300 p-4 rounded-lg border border-violet-900 focus:border-violet-700 focus:outline-none resize-none"
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                  placeholder="Enter your notes here..."
                />
              ) : // Embed the PDF inside an iframe
              modalContent ? (
                <iframe
                  src={modalContent}
                  title="PDF Result"
                  className="w-full h-[500px] border border-gray-700 rounded-lg"
                />
              ) : (
                <p className="text-gray-400 text-center">Loading PDF...</p>
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

export default AppRow;
