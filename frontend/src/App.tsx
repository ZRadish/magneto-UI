// import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage"; // Import LoginPage
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import FileUploadPage from "./pages/FileUploadPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./dashboard/DashboardPage";
import GuidancePage from "./pages/GuidancePage";
import TutorialPage from "./pages/TRTutorial";
import ProfilePage from "./pages/ProfilePage";
import FAQPage from "./pages/FAQ";
import ProtectedRoute from "./components/ProtectedRoute";
const App = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAuthenticated = !!user; // Check if user is authenticated
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/upload" element={<FileUploadPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/guidance" element={<GuidancePage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/faq" element={<FAQPage />} />

          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
