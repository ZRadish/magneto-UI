// controllers/sampleController.js
import { spawn } from 'child_process';

export const getSampleData = (req, res) => {
    res.json({ message: "Hello from the sample route!" });
  };

export const runPythonScript = (req, res) => {
  const pythonProcess = spawn('python3', ['scripts/sampleScript.py']); // Ensure the path is correct

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python output: ${data}`);
    res.json({ output: data.toString() });
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
    res.status(500).json({ error: data.toString() });
  });

  // Send input to the Python script
  pythonProcess.stdin.write('Hello from Node.js\n');
  pythonProcess.stdin.end();
};
