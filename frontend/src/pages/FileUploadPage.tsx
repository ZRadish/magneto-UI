import { useState } from "react";
import axios, { AxiosProgressEvent } from "axios";
import { motion } from "framer-motion";
import { UploadCloud, Play, AlertCircle, X, Loader } from "lucide-react";
import api from "../utils/api";

// Type definitions for oracles
type OracleId =
  | "languageChange"
  | "themeChange"
  | "userInput"
  | "rotation"
  | "backButton";

type SelectedOracles = {
  [K in OracleId]: boolean;
};

const FileUploadPage = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState<{ started: boolean; pc: number }>({
    started: false,
    pc: 0,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [selectedOracles, setSelectedOracles] = useState<SelectedOracles>({
    languageChange: false,
    themeChange: false,
    userInput: false,
    rotation: false,
    backButton: false,
  });

  const oracles: { id: OracleId; label: string }[] = [
    { id: "languageChange", label: "Language Change" },
    { id: "themeChange", label: "Theme Change" },
    { id: "userInput", label: "User Input" },
    { id: "rotation", label: "Rotation" },
    { id: "backButton", label: "Back Button" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(selectedFiles);
    }
  };

  const handleDeleteFile = (index: number) => {
    if (!files) return;
    const updatedFiles = Array.from(files).filter((_, i) => i !== index);
    setFiles(updatedFiles as unknown as FileList);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      setFiles(droppedFiles);
    }
  };

  const handleOracleChange = (oracleId: OracleId) => {
    setSelectedOracles((prev) => ({
      ...prev,
      [oracleId]: !prev[oracleId],
    }));
  };

  const uploadFile = async () => {
    if (!files || files.length === 0) {
      setMsg("No files selected. Please choose files to upload.");
      return;
    }

    const fd = new FormData();
    Array.from(files).forEach((file, index) => {
      fd.append(`file${index}`, file);
    });

    setMsg("Uploading and processing...");
    setProgress((prevState) => ({ ...prevState, started: true }));

    try {
      const uploadResponse = await api.post("/files/upload", fd, {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const progressPercentage = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setProgress((prevState) => ({
              ...prevState,
              pc: progressPercentage,
            }));
          }
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMsg("Files uploaded and processed successfully!");
      console.log("Upload response:", uploadResponse.data);
    } catch (error) {
      setMsg("Upload or processing failed");
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else {
        console.error(error);
      }
    }
  };

  const atLeastOneOracleSelected = Object.values(selectedOracles).some(
    (value) => value
  );
  const hasFiles = files && files.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              MAGNETO Testing Interface
            </h1>
            <p className="text-gray-400 text-center mt-2">
              Upload files and select oracles to run automated tests
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* File Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${
                  dragOver
                    ? "border-green-500 bg-opacity-10 bg-green-500"
                    : "border-gray-600"
                }
                ${hasFiles ? "bg-opacity-10 bg-green-500" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Upload Test Files
                </h3>
                <p className="text-sm text-gray-400">
                  Drag and drop your files here, or click to select files
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  id="file-upload"
                />
                <button
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Select Files
                </button>
              </div>
            </div>

            {/* File List */}
            {files && files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-white">Selected Files:</h3>
                <div className="space-y-2">
                  {Array.from(files).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700 bg-opacity-50 rounded-lg"
                    >
                      <span className="text-white truncate">{file.name}</span>
                      <button
                        onClick={() => handleDeleteFile(index)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Oracle Selection */}
            <div className="space-y-4">
              <h3 className="font-medium text-white">
                Select Oracles to Test:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {oracles.map((oracle) => (
                  <label
                    key={oracle.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOracles[oracle.id]}
                      onChange={() => handleOracleChange(oracle.id)}
                      className="w-4 h-4 rounded border-gray-500 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                    />
                    <span className="text-sm font-medium text-white">
                      {oracle.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            {progress.started && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progress.pc}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-right">
                  {progress.pc}%
                </p>
              </div>
            )}

            {/* Validation Messages */}
            {(!atLeastOneOracleSelected || !hasFiles) && (
              <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-white text-sm">
                  {!atLeastOneOracleSelected &&
                    "Please select at least one oracle. "}
                  {!hasFiles && "Please upload at least one file."}
                </p>
              </div>
            )}

            {/* Status Message */}
            {msg && (
              <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <p className="text-white text-sm">{msg}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700">
            <button
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-semibold
                ${
                  !atLeastOneOracleSelected || !hasFiles
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                } transition-all duration-200`}
              onClick={uploadFile}
              disabled={!atLeastOneOracleSelected || !hasFiles}
            >
              {progress.started ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>Run Selected Tests</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploadPage;
