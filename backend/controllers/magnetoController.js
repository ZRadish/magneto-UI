import { spawn } from 'child_process';
import path from 'path';
import { retrieveFileFromGridFS, runPythonScript } from '../services/magnetoService.js';
import fs from 'fs';
import { updateTestAfterRun } from '../services/testService.js';


import AdmZip from 'adm-zip';


export const runThemeCheck = async (req, res) => {
  const { argA, argB, testId } = req.body;

  try {
    // Define the unzipped directory
    const unzipDir = path.join('/app/temp/unzipped', testId);
    console.log(`[BACKEND] Running Python script on unzipped directory: ${unzipDir}`);

    // Check if the unzipped directory exists
    if (!fs.existsSync(unzipDir)) {
      throw new Error(`Unzipped directory not found: ${unzipDir}`);
    }

    // Copy dependencies from Magneto to the unzipped directory
    const magnetoDir = '/app/magneto';
    const dependencies = [
      'themeChange/themeCheck.py',
      'themeChange/binaryClassifier.py',
      'themeChange/labelPredictor.py',
      'themeChange/model_cifar.pt', 
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'readTextInImage',
      'pyproject.toml',
    ];

    for (const dep of dependencies) {
      const src = path.join(magnetoDir, dep);
      const dest = path.join(unzipDir, path.basename(dep)); // Copy files to the unzipped directory
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }

    console.log(`[BACKEND] Dependencies copied to: ${unzipDir}`);

    // Run the Python script
    const scriptPath = path.join(unzipDir, 'themeCheck.py');
    const scriptArgs = [
      '-a', argA,
      '-b', argB,
      '--unzip-dir', unzipDir // Add the unzipped directory path
    ];

    const pythonProcess = spawn('/root/.local/bin/poetry', ['run', 'python', scriptPath, ...scriptArgs], {
      cwd: '/app/magneto/themeChange', // Correct working directory
      env: { ...process.env, PYTHONPATH: unzipDir }, // Adjust PYTHONPATH to include unzipped files
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('[BACKEND] Python script output:', output);

        // Update the test result and status in the database
        try {
          await updateTestAfterRun(testId, {
            result: output,
            status: 'completed', // Update status to completed
          });

          res.status(200).json({ success: true, output });
        } catch (dbError) {
          console.error('[BACKEND] Error updating test:', dbError.message);
          res.status(500).json({ success: false, error: dbError.message });
        }
      } else {
        console.error('[BACKEND] Python script error:', errorOutput);
        res.status(500).json({ success: false, error: errorOutput });
      }
    });
  } catch (error) {
    console.error('[BACKEND] Error in runMagnetoAndSaveResult:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



export const runBackButton = async (req, res) => {
  const { argA, argB, testId } = req.body;

  try {
    // Define the unzipped directory
    const unzipDir = path.join('/app/temp/unzipped', testId);
    console.log(`[BACKEND] Running Python script on unzipped directory: ${unzipDir}`);

    // Check if the unzipped directory exists
    if (!fs.existsSync(unzipDir)) {
      throw new Error(`Unzipped directory not found: ${unzipDir}`);
    }

    // Copy dependencies from Magneto to the unzipped directory
    const magnetoDir = '/app/magneto';
    const dependencies = [
      'backButton/SSIM-withoutReport.py',
      'backButton/binaryClassifier.py',
      'backButton/labelPredictor.py',
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'readTextInImage',
      'pyproject.toml',
    ];

    for (const dep of dependencies) {
      const src = path.join(magnetoDir, dep);
      const dest = path.join(unzipDir, path.basename(dep)); // Copy files to the unzipped directory
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }

    console.log(`[BACKEND] Dependencies copied to: ${unzipDir}`);

    // Run the Python script
    const scriptPath = path.join(unzipDir, 'SSIM-withoutReport.py');
    const scriptArgs = [
      '-a', argA,
      '-b', argB,
      '--unzip-dir', unzipDir // Add the unzipped directory path
    ];

    const pythonProcess = spawn('/root/.local/bin/poetry', ['run', 'python', scriptPath, ...scriptArgs], {
      cwd: '/app/magneto/backButton', 
      env: { ...process.env, PYTHONPATH: unzipDir }, // Adjust PYTHONPATH to include unzipped files
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('[BACKEND] Python script output:', output);

        // Update the test result and status in the database
        try {
          await updateTestAfterRun(testId, {
            result: output,
            status: 'completed', // Update status to completed
          });

          res.status(200).json({ success: true, output });
        } catch (dbError) {
          console.error('[BACKEND] Error updating test:', dbError.message);
          res.status(500).json({ success: false, error: dbError.message });
        }
      } else {
        console.error('[BACKEND] Python script error:', errorOutput);
        res.status(500).json({ success: false, error: errorOutput });
      }
    });
  } catch (error) {
    console.error('[BACKEND] Error in runMagnetoAndSaveResult:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const runLanguageDetection = async (req, res) => {
  const { argA, argB, testId } = req.body;

  try {
    // Define the unzipped directory
    const unzipDir = path.join('/app/temp/unzipped', testId);
    console.log(`[BACKEND] Running Python script on unzipped directory: ${unzipDir}`);

    // Check if the unzipped directory exists
    if (!fs.existsSync(unzipDir)) {
      throw new Error(`Unzipped directory not found: ${unzipDir}`);
    }

    // Copy dependencies from Magneto to the unzipped directory
    const magnetoDir = '/app/magneto';
    const dependencies = [
      'languageDetection/detectLanguageAll.py',
      'languageDetection/detectLanguageNext.py',
      'languageDetection/language_code.json',
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'pyproject.toml',
    ];

    for (const dep of dependencies) {
      const src = path.join(magnetoDir, dep);
      const dest = path.join(unzipDir, path.basename(dep)); // Copy files to the unzipped directory
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }

    console.log(`[BACKEND] Dependencies copied to: ${unzipDir}`);

    // Run the Python script
    const scriptPath = path.join(unzipDir, 'detectLanguageAll.py');
    const scriptArgs = [
      '-a', argA,
      '-b', argB,
      '--unzip-dir', unzipDir // Add the unzipped directory path
    ];

    const pythonProcess = spawn('/root/.local/bin/poetry', ['run', 'python', scriptPath, ...scriptArgs], {
      cwd: '/app/magneto/languageDetection', // Set working directory to the unzipped directory
      env: { ...process.env, PYTHONPATH: unzipDir }, // Adjust PYTHONPATH to include unzipped files
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('[BACKEND] Python script output:', output);

        // Update the test result and status in the database
        try {
          await updateTestAfterRun(testId, {
            result: output,
            status: 'completed', // Update status to completed
          });

          res.status(200).json({ success: true, output });
        } catch (dbError) {
          console.error('[BACKEND] Error updating test:', dbError.message);
          res.status(500).json({ success: false, error: dbError.message });
        }
      } else {
        console.error('[BACKEND] Python script error:', errorOutput);
        res.status(500).json({ success: false, error: errorOutput });
      }
    });
  } catch (error) {
    console.error('[BACKEND] Error in runMagnetoAndSaveResult:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const runUserEnteredData = async (req, res) => {
  const { argA, argB, testId } = req.body; // Including `testId` for the unzipped directory

  try {
    // Define the unzipped directory
    const unzipDir = path.join('/app/temp/unzipped', testId);
    console.log(`[BACKEND] Running Python script on unzipped directory: ${unzipDir}`);

    // Check if the unzipped directory exists
    if (!fs.existsSync(unzipDir)) {
      throw new Error(`Unzipped directory not found: ${unzipDir}`);
    }

    // Copy dependencies from Magneto to the unzipped directory
    const magnetoDir = '/app/magneto';
    const dependencies = [
      'userEnteredData/findTriggerCheckInput.py',
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'readTextInImage.py',
      'pyproject.toml',
    ];

    for (const dep of dependencies) {
      const src = path.join(magnetoDir, dep);
      const dest = path.join(unzipDir, path.basename(dep)); // Copy files to the unzipped directory
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    }

    console.log(`[BACKEND] Dependencies copied to: ${unzipDir}`);

    // Run the Python script
    const scriptPath = path.join(unzipDir, 'findTriggerCheckInput.py');
    const scriptArgs = [
      '-a', argA,
      '-b', argB,
      '--unzip-dir', unzipDir // Add the unzipped directory path
    ];

    const pythonProcess = spawn('/root/.local/bin/poetry', ['run', 'python', scriptPath, ...scriptArgs], {
      cwd: '/app/magneto/userEnteredData', // Set working directory to the unzipped directory
      env: { ...process.env, PYTHONPATH: unzipDir }, // Adjust PYTHONPATH to include unzipped files
    });

    let output = '';
    let errorOutput = '';

    // Capture standard output
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Capture error output
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('[BACKEND] Python script output:', output);

        // Update the test result and status in the database
        try {
          await updateTestAfterRun(testId, {
            result: output,
            status: 'completed', // Update status to completed
          });

          res.status(200).json({ success: true, output });
        } catch (dbError) {
          console.error('[BACKEND] Error updating test:', dbError.message);
          res.status(500).json({ success: false, error: dbError.message });
        }
      } else {
        console.error('[BACKEND] Python script error:', errorOutput);
        res.status(500).json({ success: false, error: errorOutput });
      }
    });
  } catch (error) {
    console.error('[BACKEND] Error in runMagnetoAndSaveResult:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
