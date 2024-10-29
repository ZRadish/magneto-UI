// src/pages/ExamplePage.tsx
import React, { useState } from 'react';
import { getSampleData, runPythonScript } from '../services/sampleService';

const ExamplePage: React.FC = () => {
  // State to store API responses
  const [sampleData, setSampleData] = useState<string | null>(null);
  const [pythonScriptResult, setPythonScriptResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handler to call getSampleData API
  const handleGetSampleData = async () => {
    setLoading(true);
    try {
      const data = await getSampleData();
      setSampleData(data.message); // Assuming `data` has a `message` field
    } catch (error) {
      console.error('Error fetching sample data:', error);
      setSampleData('Error fetching sample data');
    }
    setLoading(false);
  };

  // Handler to call runPythonScript API
  const handleRunPythonScript = async () => {
    setLoading(true);
    try {
      const result = await runPythonScript();
      setPythonScriptResult(result.output); // Assuming `result` has an `output` field
    } catch (error) {
      console.error('Error running Python script:', error);
      setPythonScriptResult('Error running Python script');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Example Page</h1>
      <p>This is an example page setup in TypeScript.</p>

      <div>
        <button onClick={handleGetSampleData} disabled={loading}>
          Get Sample Data
        </button>
        {sampleData && <p>Sample Data Response: {sampleData}</p>}
      </div>

      <div>
        <button onClick={handleRunPythonScript} disabled={loading}>
          Run Python Script
        </button>
        {pythonScriptResult && <p>Python Script Output: {pythonScriptResult}</p>}
      </div>
    </div>
  );
};

export default ExamplePage;
