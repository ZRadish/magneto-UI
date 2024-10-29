// src/services/sampleService.ts
import api from '../utils/api';

// Fetches sample data from the backend
export const getSampleData = async () => {
  const response = await api.get('/sample/hello');
  return response.data;
};

// Runs a Python script on the backend
export const runPythonScript = async () => {
  const response = await api.get('/sample/run-python');
  return response.data;
};
