import { spawn } from 'child_process';
import path from 'path';

export const runThemeCheck = (req, res) => {
    const { argA, argB } = req.body; // Expecting `argA` and `argB` from the client request
  
    const scriptPath = path.join('/app/magneto/themeChange', 'themeCheck.py');
    const scriptArgs = ['-a', argA, '-b', argB];
  
    // Spawn the Python process using Poetry
    const pythonProcess = spawn('/root/.local/bin/poetry', ['run', 'python', scriptPath, ...scriptArgs], {
        cwd: '/app/magneto/themeChange', // Correct working directory
        env: { ...process.env, PYTHONPATH: '/app/magneto' },
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
  
    // Handle process close
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.status(200).json({ success: true, output });
      } else {
        res.status(500).json({ success: false, error: errorOutput });
      }
    });
  };