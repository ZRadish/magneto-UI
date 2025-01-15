import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Download, Save } from "lucide-react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import Joyride, { STATUS } from "react-joyride";
import SideBar from "../components/SideBar";

interface AppTest {
  id: string;
  name: string;
  dateTime: string;
  oracles: string[]; // Changed to array of oracle types that were tested
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
  setModalOpen: (isOpen: boolean) => void;
}> = ({ app, onUpdateNotes, setModalOpen }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    type: "notes" | "results";
    testId: string;
  } | null>(null);
  const [editableNotes, setEditableNotes] = useState("");

  const handleDownload = (e: React.MouseEvent, test: AppTest) => {
    e.stopPropagation();
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
    setModalOpen(true);
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
        id="app-row"
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
                <th className="p-2">Oracles Tested</th>
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
                      {test.oracles.map((oracle, index) => (
                        <div key={index}>{oracle}</div>
                      ))}
                    </div>
                  </td>
                  <td className="p-2">
                    <button
                      id="view-notes-btn"
                      className="text-violet-500 hover:text-violet-400 transition-colors"
                      onClick={() => openModal("notes", test.id)}
                    >
                      View/Edit Notes
                    </button>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <button
                        id="view-results-btn"
                        className="text-violet-500 hover:text-violet-400 transition-colors"
                        onClick={() => openModal("results", test.id)}
                      >
                        View Results
                      </button>
                      <button
                        id="download-btn"
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

const GuidancePage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [runTourOnMount, setRunTourOnMount] = useState(true);

  // Joyride steps
  const steps = [
    {
      target: "#run-test-btn",
      content:
        "Click here to start a new test. This will let you select which oracles to test for your application.",
      disableBeacon: true,
    },
    {
      target: "#app-row",
      content: "Click on an app to expand and see all its test results.",
    },
    {
      target: "#view-notes-btn",
      content:
        "View and edit notes for each test run. This helps track important observations.",
    },
    {
      target: "#view-results-btn",
      content: "View detailed results from your test run.",
    },
    {
      target: "#download-btn",
      content: "Download the test results for offline viewing or sharing.",
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Store in localStorage that the user has seen the tour
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  // Check if user has seen tour before
  React.useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (hasSeenTour) {
      setRunTourOnMount(false);
    }
  }, []);

  const [apps, setApps] = useState<App[]>([
    {
      id: "1",
      name: "App 1",
      tests: [
        {
          id: "1",
          name: "12.zip",
          dateTime: "2024-01-14 10:00",
          oracles: ["Language", "Theme"], // Only showing which oracles were tested
          notes: "Test notes for App 1",
          results: "Test results for App 1",
        },
        {
          id: "2",
          name: "13.zip",
          dateTime: "2024-01-14 10:00",
          oracles: ["Language", "Orientation"], // Different combination of oracles
          notes: "Test notes for App 1 test 2",
          results: "Test results for App 1 test 2",
        },
      ],
    },
    {
      id: "2",
      name: "App 2",
      tests: [
        {
          id: "2",
          name: "34.zip",
          dateTime: "2024-01-14 12:00",
          oracles: ["Theme", "Orientation"], // Another combination
          notes: "",
          results: "Test results for App 2",
        },
      ],
    },
  ]);

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
      <Joyride
        steps={steps}
        run={runTourOnMount}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#8B5CF6",
            backgroundColor: "#1F2937",
            textColor: "#F3F4F6",
            arrowColor: "#1F2937",
            overlayColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      />
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
            id="run-test-btn"
            onClick={() => navigate("/run-test")}
            className="px-6 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Play size={20} />
            <span>Run Test</span>
          </button>
        </div>

        <div className="space-y-4">
          {apps.map((app) => (
            <AppRow
              key={app.id}
              app={app}
              onUpdateNotes={handleUpdateNotes}
              setModalOpen={setIsModalOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidancePage;
