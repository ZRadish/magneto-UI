import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Book,
  Code,
  Settings,
  Cpu,
  Shield,
  GitBranch,
  AlertCircle,
  ArrowLeft,
  Edit,
  Eye,
  Globe,
  Server,
  Smartphone,
  Zap,
} from "lucide-react";
import SideBar from "../components/SideBar";
import { motion } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const faqData: FAQItem[] = [
    {
      id: "getting-started-overview",
      category: "Getting Started",
      question: "What is MAGNETO, and how does it help Android developers?",
      answer:
        "MAGNETO is an automated GUI-based testing tool for Android applications. It helps developers identify UI inconsistencies and functional issues using five predefined oracles, ensuring app reliability and a smoother user experience.",
      icon: <Book className="w-5 h-5 text-violet-400" />,
    },
    {
      id: "testing-oracles",
      category: "Testing",
      question:
        "What types of tests does MAGNETO perform on Android applications?",
      answer:
        "MAGNETO runs four oracle-based tests: Back Button functionality, Language Change, Theme Change, and User-Entered Data persistence. These tests identify common non-crashing bugs that affect user experience.",
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
    },
    {
      id: "integration-process",
      category: "Integration",
      question:
        "How does MAGNETO integrate with existing Android development workflows?",
      answer:
        "MAGNETO can be integrated into development workflows via its command-line interface or through our web-based frontend. Developers can upload test input files, run automated tests, and retrieve detailed reports on detected issues.",
      icon: <Code className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: "oracle-explanation",
      category: "Testing",
      question:
        "What are the four oracles used by MAGNETO for automated testing?",
      answer:
        "MAGNETO's five oracles include:\n1. **Back Button Oracle** - Ensures proper navigation when pressing back.\n2. **Language Change Oracle** - Verifies that all UI text updates to the selected language.\n3. **Theme Change Oracle** - Confirms consistent UI appearance after switching themes.\n4. **User-Entered Data Oracle** - Ensures user input remains after interactions like form submissions.",
      icon: <GitBranch className="w-5 h-5 text-green-400" />,
    },
    {
      id: "security-testing",
      category: "Security",
      question:
        "What security vulnerabilities can MAGNETO identify in an Android application?",
      answer:
        "MAGNETO detects potential security risks such as improper input validation, missing error handling, and UI inconsistencies that could lead to data leaks or unintended user actions.",
      icon: <Shield className="w-5 h-5 text-red-400" />,
    },
    {
      id: "system-requirements",
      category: "Getting Started",
      question: "What are the system requirements for running MAGNETO?",
      answer:
        "MAGNETO requires a system with at least 16GB RAM, a multi-core processor, and Android Studio with ADB installed. It supports Android devices and emulators running Android 8.0 (API level 26) and above.",
      icon: <Settings className="w-5 h-5 text-gray-400" />,
    },
    {
      id: "real-device-support",
      category: "Integration",
      question:
        "Can MAGNETO be used on real Android devices, or is it limited to emulators?",
      answer:
        "MAGNETO supports both real Android devices and emulators. Developers can test applications on physical devices via ADB or use an emulator for controlled test environments.",
      icon: <Smartphone className="w-5 h-5 text-green-400" />,
    },
    {
      id: "input-validation",
      category: "Testing",
      question:
        "How does MAGNETO handle user input validation in mobile applications?",
      answer:
        "MAGNETO verifies that user-entered data is preserved across interactions, such as screen rotations or navigating between pages. It compares stored data with expected values to detect discrepancies.",
      icon: <Edit className="w-5 h-5 text-blue-400" />,
    },
    {
      id: "ui-analysis",
      category: "Testing",
      question:
        "What technologies does MAGNETO use for analyzing screenshots and UI behavior?",
      answer:
        "MAGNETO employs OCR (Optical Character Recognition) for text detection, SSIM (Structural Similarity Index) for image comparisons, and deep learning models to analyze UI consistency and detect visual anomalies.",
      icon: <Eye className="w-5 h-5 text-purple-400" />,
    },
    {
      id: "multilingual-support",
      category: "Testing",
      question: "Does MAGNETO support testing for multilingual applications?",
      answer:
        "Yes, MAGNETO's Language Change Oracle ensures that all UI text updates correctly when switching languages. It uses natural language detection to verify text consistency.",
      icon: <Globe className="w-5 h-5 text-blue-400" />,
    },
    {
      id: "navigation-testing",
      category: "Testing",
      question:
        "How does MAGNETO’s back button oracle ensure proper navigation flow?",
      answer:
        "MAGNETO monitors UI transitions before and after a back button press. It compares screen structures to ensure the app navigates correctly without unexpected behavior or data loss.",
      icon: <ArrowLeft className="w-5 h-5 text-gray-400" />,
    },
    {
      id: "common-issues",
      category: "Testing",
      question:
        "What are the common issues that MAGNETO detects in Android applications?",
      answer:
        "MAGNETO detects issues such as UI element misalignment, missing translations after language changes, lost user input on rotation, improper navigation after pressing back, and inconsistent theme application.",
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    },
    {
      id: "ci-cd-integration",
      category: "Integration",
      question:
        "How can developers integrate MAGNETO with their CI/CD pipeline?",
      answer:
        "MAGNETO can be integrated into CI/CD workflows using command-line scripts. Developers can configure automated test runs during build processes and receive detailed test reports for continuous quality assurance.",
      icon: <Server className="w-5 h-5 text-gray-400" />,
    },
  ];
  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = () => {
      const storedSidebarState = localStorage.getItem("sidebarOpen");
      setIsSidebarOpen(storedSidebarState === "true");
    };

    window.addEventListener("storage", handleSidebarToggle);

    return () => {
      window.removeEventListener("storage", handleSidebarToggle);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 to-gray-950 pt-16">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full z-50">
        <SideBar />
      </div>

      {/* Content */}
      <motion.div
        animate={{
          marginLeft: isSidebarOpen ? "16rem" : "5rem",
          width: isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 5rem)",
        }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex justify-center px-8 pb-16"
      >
        <div className="w-full max-w-5xl mt-8">
          <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
            MAGNETO FAQ
          </h1>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 bg-slate-800 border border-violet-500/30 rounded-xl 
      focus:outline-none focus:ring-2 focus:ring-violet-700 text-gray-300 
      transition duration-300 ease-in-out shadow-lg hover:border-violet-500/50"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          </div>

          {/* Backdrop container with Scrollable Content */}
          <div
            className="bg-slate-900/70 backdrop-blur-sm border border-violet-500/20 rounded-2xl 
    h-[calc(100vh-350px)] overflow-hidden shadow-2xl"
          >
            <div className="h-full overflow-y-auto scrollbar-hide px-8 py-4">
              {" "}
              {/* Adjusted padding */}
              <div className="space-y-4">
                {faqData
                  .filter(
                    (faq) =>
                      faq.question
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      faq.answer
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-slate-800/50 border border-violet-500/10 rounded-xl 
              overflow-hidden transition duration-300 ease-in-out 
              hover:border-violet-500/40 hover:shadow-lg"
                    >
                      <button
                        onClick={() =>
                          setOpenFAQId(openFAQId === faq.id ? null : faq.id)
                        }
                        className="flex justify-between w-full p-4 text-left 
                text-gray-300 font-medium hover:bg-slate-800/50 
                transition duration-200 ease-in-out"
                      >
                        <span className="flex items-center gap-3">
                          {faq.icon}
                          <span className="text-lg">{faq.question}</span>
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${
                            openFAQId === faq.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openFAQId === faq.id && (
                        <div className="p-4 pt-4 text-gray-400 text-base">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FAQPage;
