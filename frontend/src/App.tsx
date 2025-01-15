import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage"; // Import LoginPage
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import FileUploadPage from "./pages/FileUploadPage";
import Dashboard from "./dashboard/DashboardPage";
import GuidancePage from "./pages/GuidancePage";
import TutorialPage from "./pages/TRTutorial";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/upload" element={<FileUploadPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guidance" element={<GuidancePage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
