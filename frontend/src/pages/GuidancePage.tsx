import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";
import {
  Folder,
  ChevronRight,
  Play,
  Download,
  Trash2,
  Edit,
} from "lucide-react";
import SideBar from "../components/SideBar";
import { useNavigate } from "react-router-dom";

const GuidancePage: React.FC = () => {
  // Initialize state with the first app's ID open
  const [expandedApps, setExpandedApps] = useState<string[]>(["1"]);
  const [runTour, setRunTour] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (runTour) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = ""; // Reset on unmount
    };
  }, [runTour]);

  // Mock data with sample mockTests
  const mockApps = [
    {
      id: "1",
      name: "Sample Mobile App",
      description: "A sample mobile application for testing user interfaces",
      mockTests: [
        {
          _id: "t1",
          testName: "Theme Consistency Check",
          fileName: "17.zip",
          createdAt: new Date("2024-03-01").toLocaleString(),
          status: "completed",
          oracleSelected: "Theme Check",
          notes: "Initial theme test for color consistency",
          result: "Passed",
        },
        {
          _id: "t2",
          testName: "Back Button Functionality",
          fileName: "18.zip",
          createdAt: new Date("2024-03-15").toLocaleString(),
          status: "completed",
          oracleSelected: "Back Button",
          notes: "Checking navigation flow",
          result: "Pending",
        },
        {
          _id: "t3",
          testName: "Language Detection Test",
          fileName: "21.zip",
          createdAt: new Date("2024-02-20").toLocaleString(),
          status: "completed",
          oracleSelected: "Language Detection",
          notes: "Verifying multi-language support",
          result: "Passed",
        },
        {
          _id: "t4",
          testName: "User Input Validation",
          fileName: "22.zip",
          createdAt: new Date("2024-03-10").toLocaleString(),
          status: "pending",
          oracleSelected: "User Input",
          notes: "Checking input field validations",
          result: "Pending",
        },
      ],
    },
    {
      id: "2",
      name: "Language Learning App",
      description: "An educational app for multilingual learning",
      mockTests: [],
    },
  ];

  // Static progress for the pending test
  const testProgress: Record<string, number> = {
    t4: 67,
  };

  // Toggle app expansion
  const toggleAppExpansion = (appId: string) => {
    setExpandedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const getStatusColorClass = (status: string) => {
    return status === "completed"
      ? "bg-green-500/20 text-green-400"
      : "bg-yellow-500/20 text-yellow-400";
  };

  const getOracleColorClass = (oracle: string) => {
    const colorClasses = {
      "Theme Check": "bg-orange-900/20 text-orange-400",
      "Back Button": "bg-blue-900/20 text-blue-400",
      "Language Detection": "bg-pink-900/20 text-pink-400",
      "User Input": "bg-yellow-900/20 text-yellow-400",
    };
    return (
      colorClasses[oracle as keyof typeof colorClasses] ||
      "bg-violet-900/20 text-violet-400"
    );
  };

  // Updated Joyride tour steps
  const tourSteps: Step[] = [
    {
      target: ".run-test-button",
      content:
        "When you click the Run Test button, you'll be guided through a series of modals where you'll need to provide detailed information about the app and the specific test you wish to run. These modals will ensure all the necessary parameters are collected before initiating the test.",
      disableBeacon: true,
    },
    {
      target: ".app-name-1",
      content: "Here you can see the name of your application.",
    },
    {
      target: ".app-edit-icon",
      content: "Press this here to edit the application name.",
    },
    {
      target: ".app-description",
      content: "This section provides a brief description of the application.",
    },
    {
      target: ".first-test-row",
      content:
        "This here is one of the tests ran for your application. It shows details like test name, file, and other relevant information.",
    },
    {
      target: ".first-file-download-button",
      content:
        "Click this button to download the file uploaded to run the test.",
    },
    {
      target: ".oracle-selected",
      content:
        "This shows the type of oracle (testing method) selected for the test.",
    },
    {
      target: ".test-progress-bar",
      content:
        "For pending tests, a progress bar is displayed until the test finishes running. Once completed, the test information appears, and the status updates to 'completed'. ",
    },
    {
      target: ".notes-edit-button",
      content:
        "Use this button here to view or edit notes for a specific test.",
    },
    {
      target: ".results-view-icon",
      content: "Click this icon to view the test results.",
    },
    {
      target: ".results-download-icon",
      content: "Use this icon to download the test results.",
    },
    {
      target: ".test-delete-icon",
      content: "This icon here allows you to delete the test.",
    },
  ];

  // Handle Joyride callback
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    // When tour is finished, navigate to dashboard
    if (status === "finished" || status === "skipped") {
      setRunTour(false);
      navigate("/tutorial");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950 overflow-hidden">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        scrollToFirstStep={false}
        spotlightClicks={false}
        disableOverlayClose
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: "#8b5cf6", // Tailwind violet-500
            overlayColor: "rgba(0, 0, 0, 0.7)", // Darker overlay background
          },
          spotlight: {
            borderRadius: "8px",
            boxShadow: "0 0 0 2px #b794f4, 0 0 20px rgba(139, 92, 270, 0.5)", // Violet glow effect
          },
        }}
        floaterProps={{
          styles: {
            container: {
              zIndex: 10000,
            },
          },
          disableAnimation: true,
        }}
      />

      <SideBar />
      <div className="ml-64 p-8 relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-2">
              Guidance Page
            </h1>
            <h2 className="text-xl font-semibold text-gray-400">Apps</h2>
          </div>
          <button className="run-test-button px-6 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg flex items-center space-x-2">
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
          {mockApps.map((app) => (
            <div
              key={app.id}
              className="border border-violet-900 rounded-2xl mb-6 hover:border-violet-700 transition-colors hover:shadow-xl hover:shadow-violet-900/50"
            >
              <div
                className={`app-name-1 flex items-center p-6 cursor-pointer bg-gray-900 rounded-2xl`}
                onClick={() => toggleAppExpansion(app.id)}
              >
                <Folder className="mr-4 text-violet-500" size={24} />
                <span className="flex-grow text-gray-400">{app.name}</span>
                <button
                  className="mr-4 text-violet-500 hover:text-violet-400 transition-colors app-edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Edit size={24} />
                </button>
                <ChevronRight
                  size={24}
                  className={`text-violet-500 transition-transform ${
                    expandedApps.includes(app.id) ? "rotate-90" : ""
                  }`}
                />
              </div>

              {expandedApps.includes(app.id) && (
                <div className="p-6 bg-gray-900/50">
                  <div className="text-gray-400 mb-6 border border-gray-700 rounded-2xl p-4 app-description">
                    <p className="text-gray-400">{app.description}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="p-4">Test Name</th>
                          <th className="p-4">File</th>
                          <th className="p-4">Created At</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Oracles Selected</th>
                          <th className="p-4">Notes</th>
                          <th className="p-4">Results</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-400">
                        {app.mockTests.map((test, index) => (
                          <tr
                            key={test._id}
                            className={index === 0 ? "first-test-row" : ""}
                          >
                            {test.status === "pending" ? (
                              // Pending test row with progress bar
                              <td colSpan={8} className="p-4">
                                <div className="flex items-center space-x-4 test-progress-bar">
                                  <span className="text-yellow-600 w-1/4">
                                    {test.testName}
                                  </span>
                                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div
                                      className="bg-yellow-600 h-2.5 rounded-full"
                                      style={{
                                        width: `${
                                          testProgress[test._id] || 0
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-gray-400 w-1/12">
                                    {testProgress[test._id] || 0}%
                                  </span>
                                </div>
                              </td>
                            ) : (
                              // Completed test row render
                              <>
                                <td className="p-3">{test.testName}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">
                                      {test.fileName}
                                    </span>
                                    <button
                                      className="first-file-download-button text-violet-500 hover:text-violet-400 transition-colors p-1 rounded-full hover:bg-violet-900/20 opacity-50 cursor-not-allowed"
                                      title="Download File"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3">{test.createdAt}</td>
                                <td className="p-3 test-status">
                                  <span
                                    className={`px-3 py-1.5 rounded-full text-xs ${getStatusColorClass(
                                      test.status
                                    )}`}
                                  >
                                    {test.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-3 py-1.5 ${getOracleColorClass(
                                      test.oracleSelected
                                    )} rounded-full text-xs w-44 oracle-selected`}
                                  >
                                    {test.oracleSelected}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <button className="notes-edit-button text-violet-500 hover:text-violet-400 transition-colors opacity-50 cursor-not-allowed">
                                    View/Edit
                                  </button>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <button className="results-view-icon text-violet-500 hover:text-violet-400 transition-colors opacity-50 cursor-not-allowed">
                                      View
                                    </button>
                                    <button
                                      className="results-download-icon text-violet-500 hover:text-violet-400 transition-colors p-1 rounded-full hover:bg-violet-900/20 opacity-50 cursor-not-allowed"
                                      title="Download Results"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <button
                                    className="test-delete-icon text-red-500 hover:text-red-400 transition-colors p-1 rounded-full opacity-50 cursor-not-allowed"
                                    title="Delete Test"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidancePage;
