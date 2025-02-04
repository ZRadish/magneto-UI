import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { updateTestAfterRun } from '../services/testService.js';
import { storePdfInGridFS } from '../services/fileService.js';

/**
 * Utility function to execute Python scripts, save PDFs, and clean up temp files
 */
const executePythonScript = async (scriptDir, scriptName, pdfName, dependencies, req, res) => {
  const { argA, argB, testId } = req.body;
  const unzipDir = path.join('/app/temp/unzipped', testId);
  console.log(`[BACKEND] Running Python script on unzipped directory: ${unzipDir}`);

  if (!fs.existsSync(unzipDir)) {
    return res.status(500).json({ success: false, error: `Unzipped directory not found: ${unzipDir}` });
  }

  // ✅ Ensure dependencies are copied before running the script
  const magnetoDir = '/app/magneto';
  for (const dep of dependencies) {
    const src = path.join(magnetoDir, dep);
    const dest = path.join(unzipDir, path.basename(dep));
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
  console.log(`[BACKEND] Dependencies copied to: ${unzipDir}`);

  const scriptPath = path.join(unzipDir, scriptName);
  const scriptArgs = ['-a', argA, '-b', argB, '--unzip-dir', unzipDir];

  const pythonProcess = spawn('/root/.local/bin/poetry', ['run', 'python', scriptPath, ...scriptArgs], {
    cwd: scriptDir,
    env: { ...process.env, PYTHONPATH: unzipDir },
  });

  let output = '';
  let errorOutput = '';

  pythonProcess.stdout.on('data', (data) => { output += data.toString(); });
  pythonProcess.stderr.on('data', (data) => { errorOutput += data.toString(); });

  pythonProcess.on('close', async (code) => {
    if (code === 0) {
      console.log('[BACKEND] Python script output:', output);

      // ✅ Fix the PDF path to include `argB`
      const pdfPath = path.join(unzipDir, argB, pdfName);

      if (!fs.existsSync(pdfPath)) {
        console.error(`[BACKEND] PDF not found at: ${pdfPath}`);
        return res.status(500).json({ success: false, error: `PDF file missing` });
      } else {
        console.log(`[BACKEND] PDF file exists: ${pdfPath}`);
      }

      try {
        console.log('[BACKEND] Storing PDF in GridFS...');
        const pdfFileId = await storePdfInGridFS(testId, path.basename(pdfPath), argB);
        console.log(`[BACKEND] PDF saved in GridFS with ID: ${pdfFileId}`);

        // If everything is successful, delete the unzipped directory
        console.log(`[BACKEND] Deleting unzipped folder: ${unzipDir}`);
        fs.rmSync(unzipDir, { recursive: true, force: true });
        console.log(`[BACKEND] Successfully deleted: ${unzipDir}`);
      } catch (error) {
        console.error('[BACKEND] Error storing PDF:', error.message);
      }

      await updateTestAfterRun(testId, { result: output, status: 'completed' });
      res.status(200).json({ success: true, output });
    } else {
      console.error('[BACKEND] Python script error:', errorOutput);
      res.status(500).json({ success: false, error: errorOutput });
    }
  });
};

/**
 * Run Theme Check
 */
export const runThemeCheck = (req, res) => {
  executePythonScript(
    '/app/magneto/themeChange',
    'themeCheck.py',
    'theme_detection_report.pdf',
    [
      'themeChange/themeCheck.py',
      'themeChange/binaryClassifier.py',
      'themeChange/labelPredictor.py',
      'themeChange/model_cifar.pt',
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'readTextInImage.py',
      'pyproject.toml',
    ],
    req,
    res
  );
};

/**
 * Run Back Button Test
 */
export const runBackButton = (req, res) => {
  executePythonScript(
    '/app/magneto/backButton',
    'SSIM-withoutReport.py',
    'back_button_report.pdf',
    [
      'backButton/SSIM-withoutReport.py',
      'backButton/binaryClassifier.py',
      'backButton/labelPredictor.py',
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'readTextInImage.py',
      'pyproject.toml',
    ],
    req,
    res
  );
};

/**
 * Run Language Detection
 */
export const runLanguageDetection = (req, res) => {
  executePythonScript(
    '/app/magneto/languageDetection',
    'detectLanguageAll.py',
    'language_detection_report.pdf',
    [
      'languageDetection/detectLanguageAll.py',
      'languageDetection/detectLanguageNext.py',
      'languageDetection/language_code.json',
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'pyproject.toml',
    ],
    req,
    res
  );
};

/**
 * Run User-Entered Data Test
 */
export const runUserEnteredData = (req, res) => {
  executePythonScript(
    '/app/magneto/userEnteredData',
    'findTriggerCheckInput.py',
    'user_input_report.pdf',
    [
      'userEnteredData/findTriggerCheckInput.py',
      'imageUtilities.py',
      'xmlUtilities.py',
      'poetry.lock',
      'readTextInImage.py',
      'pyproject.toml',
    ],
    req,
    res
  );
};
