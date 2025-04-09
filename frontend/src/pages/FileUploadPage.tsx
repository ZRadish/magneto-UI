import { useState } from "react";
import axios, { AxiosProgressEvent } from "axios";
import { motion } from "framer-motion";
import { UploadCloud, Play, AlertCircle, X, Loader } from "lucide-react";
import api from "../utils/api";
import { useSearchParams, useNavigate } from "react-router-dom";

const FileUploadPage = () => {
  const [searchParams] = useSearchParams();

  const testId = searchParams.get("testId");
  const oracleSelection = searchParams.get("oracleSelected");
  const appId = searchParams.get("appId");

  const [files, setFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState<{ started: boolean; pc: number }>({
    started: false,
    pc: 0,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((file) =>
        file.name.toLowerCase().endsWith(".zip")
      );

      if (selectedFiles.length === 0) {
        setMsg("Only ZIP files are allowed.");
        setFiles(null);
      } else {
        setMsg(null);
        setFiles(e.target.files);
      }
    }
  };

  const handleDeleteFile = (_index: number) => {
    setFiles(null);
    setMsg("File removed. You can upload a new one.");

    // Reset input field to allow re-selection of the same file
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      const validFiles = Array.from(droppedFiles).filter((file) =>
        file.name.toLowerCase().endsWith(".zip")
      );

      if (validFiles.length !== droppedFiles.length) {
        setMsg("Only ZIP files are allowed.");
      } else {
        setMsg(null);
      }

      setFiles(
        validFiles.length > 0 ? (validFiles as unknown as FileList) : null
      );
    }
  };
  const runMagnetoTest = async (fileName: string) => {
    console.log("Raw Oracle Selection:", oracleSelection);
    if (!oracleSelection || !testId || !appId) {
      setMsg("Missing required test parameters");
      return;
    }
    console.log(fileName);
    console.log("Test ID:", testId);
    console.log("App ID:", appId);
    console.log("Oracle Selected:", oracleSelection);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setMsg("Authorization token is missing");
      return;
    }

    // Extract test ID dynamically from the filename (e.g., Execution-24.json → 24)
    const extractedTestId = fileName.match(/\d+/)?.[0] || "unknown";
    console.log("Extracted Test ID:", extractedTestId);

    setIsProcessing(true);
    setMsg("Running Magneto test...");

    try {
      // Determine which endpoint to call based on oracle selection
      let endpoint = "";
      console.log("oracle to lower case", oracleSelection.toLowerCase());
      switch (oracleSelection.toLowerCase()) {
        case "theme check":
          endpoint = "/magneto/theme-check";
          break;
        case "back button":
          endpoint = "/magneto/back-button";
          break;
        case "user input":
          endpoint = "/magneto/user-entered-data";
          break;
        case "language detection":
          endpoint = "/magneto/language-detection";
          break;
        default:
          throw new Error("Invalid oracle selection");
      }

      const response = await api.post(
        endpoint,
        { argA: fileName, argB: extractedTestId, testId, appId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMsg("Test completed successfully!");
      return response.data;
    } catch (error) {
      setMsg(
        `Test failed: ${
          axios.isAxiosError(error)
            ? error.response?.data?.error || error.message
            : "An unexpected error occurred"
        }`
      );
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const navigate = useNavigate();
  const uploadFile = async () => {
    if (!files || files.length === 0) {
      setMsg("No files selected. Please choose files to upload.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setMsg("Authorization token is missing.");
      return;
    }

    const fd = new FormData();
    const file = files[0];
    // Extract file name without .zip
    const fileName = file.name.replace(/\.zip$/, "");
    Array.from(files).forEach((file) => {
      fd.append(`file`, file);
    });

    //fd.append("file", file);
    if (testId) fd.append("testId", testId);
    if (oracleSelection) fd.append("oracleSelected", oracleSelection);
    if (appId) fd.append("appId", appId);

    setMsg("Uploading files...");
    //setProgress((prevState) => ({ ...prevState, started: true }));
    setProgress({ started: true, pc: 0 });
    try {
      await api.post("/files/upload", fd, {
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
          Authorization: `Bearer ${token}`,
        },
      });
      //console.log("Upload Response:", uploadResponse.data); // Use the response
      setMsg("Files uploaded successfully. Starting Magneto test...");

      // Run the Magneto test with the uploaded file ID
      console.log("here", fileName);
      navigate(`/dashboard`, {
        state: {
          appId,
          testId,
          fileName,
          expandAppFolder: true, // Add a flag to indicate that the app folder should be expanded
          fromUpload: true, // Add a flag to indicate that we're coming from upload page
        },
      });
      await runMagnetoTest(fileName);
      navigate("/dashboard", { state: { testId, fileName } });
    } catch (error) {
      setMsg("Upload or processing failed");
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else {
        console.error(error);
      }
    }
  };

  const hasFiles = files && files.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl  border-2 border-violet-900 rounded-xl"
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-2">
              MAGNETO Testing Interface
            </h1>
            <p className="text-gray-200 text-center mt-2">
              Upload files and run {oracleSelection} tests
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* File Upload Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${
                  dragOver
                    ? "border-green-500 bg-opacity-10 bg-green-500"
                    : "border-gray-200"
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
            {hasFiles && (
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

            {/* Progress Bar */}
            {(progress.started || isProcessing) && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${isProcessing ? 100 : progress.pc}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-right">
                  {isProcessing ? "Processing..." : `${progress.pc}%`}
                </p>
              </div>
            )}

            {/* Validation Messages */}
            {!hasFiles && (
              <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-white text-sm">
                  Please upload a single ZIP file. Only ZIP format is accepted.
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
                  !hasFiles || isProcessing
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : " text-white bg-gradient-to-r from-red-400 to-purple-800"
                } transition-all duration-200`}
              onClick={uploadFile}
              disabled={!hasFiles || isProcessing}
            >
              {progress.started || isProcessing ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>
                {isProcessing ? "Processing..." : "Run Selected Tests"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploadPage;
