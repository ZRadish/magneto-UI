import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import AdmZip from 'adm-zip';



// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
const conn = mongoose.createConnection(mongoURI);

let gfsBucket;
conn.once('open', () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: 'files' });
});
/**
 * Recursively remove macOS artifacts and hidden files from the extracted folder.
 * - Removes the '__MACOSX' directory entirely
 * - Removes '.DS_Store' or any dot-file (".<something>")
 */
function removeMacArtifacts(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // Remove entire '__MACOSX' directory or any directory starting with '.'
    if (stat.isDirectory()) {
      if (item === '__MACOSX' || item.startsWith('.')) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        removeMacArtifacts(fullPath); // Recurse into subdirectory
      }
    } else {
      // Remove .DS_Store or any dot-file
      if (item === '.DS_Store' || item.startsWith('.')) {
        fs.unlinkSync(fullPath);
      }
    }
  }
}

/**
 * Downloads a file from GridFS and saves it as a .zip in a temporary directory
 */
export const retrieveFileFromGridFS = async (fileId) => {
  try {
    // Ensure the fileId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      throw new Error('Invalid fileId format');
    }
    const objectId = new mongoose.Types.ObjectId(fileId);

    // Check if the file exists
    const fileExists = await conn.db.collection('files.files').findOne({ _id: objectId });
    if (!fileExists) {
      throw new Error('File not found in GridFS');
    }

    // Create a 'temp' directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Define the path for the temporary .zip file
    const tempFilePath = path.join(tempDir, `${fileId}.zip`);

    // Stream the file from GridFS to disk
    return new Promise((resolve, reject) => {
      const downloadStream = gfsBucket.openDownloadStream(objectId);
      const writeStream = fs.createWriteStream(tempFilePath);

      downloadStream
        .pipe(writeStream)
        .on('finish', () => {
          console.log(`[BACKEND] File retrieved and saved to: ${tempFilePath}`);
          resolve(tempFilePath);
        })
        .on('error', (err) => {
          console.error(`[BACKEND] Error retrieving file: ${err.message}`);
          reject(err);
        });
    });
  } catch (error) {
    console.error(`[BACKEND] Error in retrieveFileFromGridFS: ${error.message}`);
    throw new Error('Failed to retrieve file from GridFS');
  }
};

/**
 * Retrieves the file from GridFS, unzips it to a directory, and removes hidden/mac artifacts.
 */
export const prepareFileFromGridFS = async (fileId) => {
  try {
    // 1. Retrieve the .zip from GridFS
    const tempZipPath = await retrieveFileFromGridFS(fileId);

    // 2. Define the directory to extract files
    //    Example: Putting it in /app/magneto/backButton/processing/<fileId>
    //    If you want it strictly in process.cwd()/temp/<fileId>, adjust accordingly.
    const magnetoDir = '/app/magneto/backButton';
    const unzipDir = path.join(magnetoDir, 'processing', fileId);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(unzipDir)) {
      fs.mkdirSync(unzipDir, { recursive: true });
    }

    // 3. Extract the archive
    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(unzipDir, /* overwrite */ true);

    // 4. Clean up hidden/macOS artifacts
    removeMacArtifacts(unzipDir);

    console.log(`[BACKEND] File unzipped to: ${unzipDir}`);

    // Return the path where the files have been extracted
    return unzipDir;
  } catch (error) {
    console.error(`[BACKEND] Error in prepareFileFromGridFS: ${error.message}`);
    throw new Error('Failed to prepare file from GridFS');
  }
};

  


// Run a Python script with the file
export const runPythonScript = (scriptPath, args, tempFilePath) => {
    console.log('Spawning Python script with:', {
      scriptPath,
      args,
      cwd: path.dirname(scriptPath),
    });
  
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('/root/.local/bin/poetry', ['run', 'python', scriptPath, ...args], {
        cwd: path.dirname(scriptPath),
        env: { ...process.env, PYTHONPATH: '/app/magneto' },
      });
  
      let output = '';
      let errorOutput = '';
  
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
  
      pythonProcess.on('close', (code) => {
        console.log('Python process closed with code:', code);
        console.log('Python stdout:', output);
        console.log('Python stderr:', errorOutput);
  
        // Clean up the temporary file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
  
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(errorOutput.trim() || 'Unknown error occurred while running the Python script'));
        }
      });
  
      pythonProcess.on('error', (err) => {
        console.error('Error spawning Python process:', err.message);
        reject(err);
      });
    });
  };
  