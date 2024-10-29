import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ExamplePage from './pages/ExamplePage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/example" element={<ExamplePage />} />
      </Routes>
    </Router>
  );
}

export default App
