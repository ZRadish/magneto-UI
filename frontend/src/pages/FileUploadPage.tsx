import { useState } from "react";
import axios, { AxiosProgressEvent } from "axios";
import { motion } from "framer-motion";
import { FileText, Loader, X } from "lucide-react";
import Input from "../components/Input";
import api from "../utils/api"; // Importing the reusable API instance

const FileUploadPage: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState<{ started: boolean; pc: number }>({
    started: false,
    pc: 0,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [, setFileInfo] = useState<any>(null); // To store metadata of the uploaded file
  const isLoading = false; // Define loading state for the button

  // Handles file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(selectedFiles); // Set the selected files to state
    }
  };

  // Handles file deletion (removes file from the selection)
  const handleDeleteFile = (index: number) => {
    if (!files) return;

    // Create a new array excluding the deleted file
    const updatedFiles = Array.from(files).filter((_, i) => i !== index);

    // Update the files state
    setFiles(updatedFiles as unknown as FileList);
  };

// Handles file upload and processing
const uploadFile = async () => {
  if (!files || files.length === 0) {
    setMsg("No files selected. Please choose a file to upload.");
    return;
  }

  const fd = new FormData();
  fd.append("file", files[0]); // Assuming single file upload

  setMsg("Uploading and processing...");
  setProgress((prevState) => ({ ...prevState, started: true }));

  try {
    // Call the /upload endpoint
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

    setMsg("File uploaded and processed successfully!");
    setFileInfo(uploadResponse.data.file); // Save file metadata
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



  // Fetches the file status
  const fetchFileStatus = async () => {
    setMsg("Fetching file status...");
    try {
      const response = await api.get("/files/file-status");
      setMsg("File status fetched successfully");
      console.log("File status:", response.data);
    } catch (error) {
      setMsg("Error fetching file status");
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Upload and Process Your File
          </h2>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Input Component for File Upload */}
            <Input
              Icon={FileText}
              type="file"
              placeholder="Choose a file"
              onChange={handleFileChange}
              className="w-full py-3 px-4 bg-gray-700 bg-opacity-60 rounded-lg border border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 file:bg-green-500 file:border-none file:text-white file:font-bold file:py-2 file:px-4 file:rounded-lg file:hover:bg-green-600 transition duration-200"
            />

            {/* Display selected files with delete button */}
            {files && files.length > 0 && (
              <div className="mt-4">
                <ul className="space-y-2">
                  {Array.from(files).map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-700 p-2 rounded-lg"
                    >
                      <span className="text-white truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload and Process Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="button"
              onClick={uploadFile}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "Upload and Process File"
              )}
            </motion.button>

            {/* Fetch Status Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="button"
              onClick={fetchFileStatus}
            >
              Fetch File Status
            </motion.button>
          </form>

          {/* Progress Bar */}
          {progress.started && (
            <div className="mt-4">
              <progress
                max="100"
                value={progress.pc}
                className="w-full h-4 rounded-full bg-gray-600"
              ></progress>
              <span className="text-white mt-2">{progress.pc}%</span>
            </div>
          )}

          {/* Message Feedback */}
          {msg && (
            <span className="block mt-4 text-center text-white">{msg}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploadPage;
