import React, { useState, useRef } from "react";
import SideBar from "../components/SideBar";
import { motion } from "framer-motion";
import {
  Book,
  ChevronRight,
  Terminal,
  Settings,
  PlayCircle,
  AlertTriangle,
  FileDown,
  FileJson,
  Image,
  FileQuestion,
  File,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  level: number;
  icon: React.ReactNode;
}

const TutorialPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const contentRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const sections: Section[] = [
    {
      id: "vid-demo",
      title: "Video Tutorial",
      level: 1,
      icon: <PlayCircle className="w-4 h-4" />,
    },
    {
      id: "what-is",
      title: "What is TraceReplayer",
      level: 1,
      icon: <Book className="w-4 h-4" />,
    },
    {
      id: "why-use",
      title: "Why Use TraceReplayer",
      level: 1,
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: "avt",
      title: "Android Video Capture Tool (AVT)",
      level: 1,
      icon: <PlayCircle className="w-4 h-4" />,
    },
    {
      id: "instructions",
      title: "Instructions for TraceReplayer and AVT",
      level: 1,
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: "prerequisites",
      title: "Prerequisites",
      level: 1,
      icon: <FileDown className="w-4 h-4" />,
    },
    {
      id: "setup",
      title: "Setting Up Android Emulator and AVT Tool",
      level: 1,
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: "config",
      title: "Preparing the Configuration File",
      level: 1,
      icon: <FileDown className="w-4 h-4" />,
    },
    {
      id: "running",
      title: "Running TraceReplayer",
      level: 1,
      icon: <PlayCircle className="w-4 h-4" />,
    },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);

    const element = contentRefs.current[id];
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = elementRect.top + scrollTop;
      const offset = viewportHeight * 0.3; //30% from the top
      const adjustedPosition = elementTop - offset;

      window.scrollTo({
        top: adjustedPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 to-gray-950">
      {/* Main SideBar */}
      <div className="fixed top-0 left-0 h-full z-50">
        <SideBar />
      </div>

      {/* Tutorial Navigation Sidebar */}
      <div
        className={`fixed top-0 left-16 h-full bg-slate-900 border-r border-violet-500/20 shadow-lg transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
        style={{ width: "16rem" }}
      >
        <div className="p-6 border-b border-violet-500/20">
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
            TraceReplayer Guide
          </h2>
        </div>
        <nav className="p-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center w-full text-left p-3 mb-1 rounded-lg ${
                section.level === 2
                  ? "ml-4 text-sm text-gray-400"
                  : "font-medium text-gray-300"
              } ${
                activeSection === section.id
                  ? "bg-violet-500/10"
                  : "hover:bg-violet-500/10"
              }`}
            >
              <span className="text-violet-400">{section.icon}</span>
              <span className="ml-3">{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-80 z-10 p-2 bg-slate-800 rounded-full shadow-lg transform transition-transform duration-300 hover:bg-slate-700 border border-violet-500/20"
        style={{ transform: isSidebarOpen ? "none" : "translateX(-16rem)" }}
      >
        <ChevronRight
          className={`w-4 h-4 text-violet-400 transition-transform duration-300 ${
            isSidebarOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Main content */}
      <motion.div
        animate={{
          marginLeft: isSidebarOpen ? "16rem" : "5rem",
          width: isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 5rem)",
        }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        <div className="max-w-5xl mt-6 mx-auto p-8">
          <section
            ref={(el) => (contentRefs.current["vid-demo"] = el)}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold text-center mt-8 mb-8 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
              TraceReplayer Guide
            </h1>

            {/* Updated Video Section with YouTube Embed */}
            <div className="mt-8 mb-12">
              <div className="bg-slate-900/50 rounded-xl shadow-lg p-8 border border-violet-500/20">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-6">
                  TraceReplayer Demo
                </h2>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full absolute top-0 left-0"
                    src="https://www.youtube-nocookie.com/embed/N-2mfqCkZ2Q?rel=0"
                    title="TraceReplayer Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-300 mt-4 text-center">
                  A demonstration of using TraceReplayer
                </p>
              </div>
            </div>
          </section>

          {/* What is Section */}
          <section
            ref={(el) => (contentRefs.current["what-is"] = el)}
            className="bg-slate-900/50 rounded-xl shadow-lg p-8 mb-8 border border-violet-500/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                <Book className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                What is TraceReplayer
              </h2>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6">
              TraceReplayer is a tool that processes human-generated interaction
              traces and converts them into an appropriate format compatible
              with MAGNETO. More specifically, it takes the raw interaction data
              collected from users interacting with an Android application and
              generates the following:
            </p>

            <div className="bg-slate-800/50 rounded-lg p-6 mb-8 border border-violet-500/20">
              <h3 className="font-semibold mb-4 text-violet-300">
                Output Types:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FileJson className="w-7 h-7 text-violet-400" />
                  <span className="text-gray-300">
                    Execution JSON file: Contains detailed execution steps and
                    metadata
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-violet-400" />
                  <span className="text-gray-300">
                    Base Screenshot: Unedited screenshot of step
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-violet-400" />
                  <span className="text-gray-300">
                    Augmented Screenshot: Displays user interaction
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-violet-400" />
                  <span className="text-gray-300">
                    GUI Screenshot: PNG of interacted GUI element
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              These outputs are necessary inputs for MAGNETO, enabling it to
              apply its five oracles.
            </p>

            <p className="text-gray-300 mb-6">
              Below are examples of screenshots generated by TraceReplayer:
            </p>

            <div className="flex flex-col items-center gap-6 mb-8">
              {/* First row with Original and Augmented screenshots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                <div className="flex flex-col items-center">
                  <div className="bg-slate-800 rounded-lg p-2 border border-violet-500/20 mb-3">
                    <img
                      src="https://mwll8uma09.ufs.sh/f/vHcR0snYouj7Yw0AnOUKJe6EyX2tgnMTqo0kSCzH5jrvmN1L"
                      alt="Original Screenshot"
                      className="rounded-lg w-full h-auto"
                    />
                  </div>
                  <h4 className="text-violet-300 font-medium text-center">
                    Original Screenshot
                  </h4>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-slate-800 rounded-lg p-2 border border-violet-500/20 mb-3">
                    <img
                      src="https://mwll8uma09.ufs.sh/f/vHcR0snYouj7Yvi9koUKJe6EyX2tgnMTqo0kSCzH5jrvmN1L"
                      alt="Augmented Screenshot"
                      className="rounded-lg w-full h-auto"
                    />
                  </div>
                  <h4 className="text-violet-300 font-medium text-center">
                    Augmented Screenshot
                  </h4>
                </div>
              </div>

              {/* Second row with centered GUI screenshot */}
              <div className="w-full max-w-md">
                <div className="flex flex-col items-center">
                  <div className="bg-slate-800 rounded-lg p-2 border border-violet-500/20 mb-3">
                    <img
                      src="https://mwll8uma09.ufs.sh/f/vHcR0snYouj7fA9kj13euSmckoJpsbdHxAIWj4ZV5M9TnyLQ"
                      alt="GUI Screenshot"
                      className="rounded-lg w-full h-auto"
                    />
                  </div>
                  <h4 className="text-violet-300 font-medium text-center">
                    GUI Screenshot
                  </h4>
                </div>
              </div>
            </div>
          </section>

          {/* Why Use Section */}
          <section
            ref={(el) => (contentRefs.current["why-use"] = el)}
            className="bg-slate-900/50 rounded-xl shadow-lg p-8 mb-8 border border-violet-500/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                <FileQuestion className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Why Use TraceReplayer
              </h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              The main reason for using TraceReplayer is to bridge the gap
              between raw user interaction data and the structured input
              required by MAGNETO. MAGNETO requires a certain format for their
              input and TraceReplayer provides just that. In addition, mobile
              applications are inherently eventdriven, and user interactions
              such as tapping, typing, and swiping are fundamental to their
              operation. By capturing real user interactions and converting them
              into a format that MAGNETO can process, we ensure that our testing
              is grounded in realistic usage scenarios. This enhances the
              reliability and validity of our testing results.
            </p>
          </section>

          <section
            ref={(el) => (contentRefs.current["avt"] = el)}
            className="bg-slate-900/50 rounded-xl shadow-lg p-8 mb-8 border border-violet-500/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                <PlayCircle className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Android Video Capture Tool (AVT)
              </h2>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">
              The Android Video Capture Tool (AVT) is a desktop application
              developed to facilitate the collection of user interaction data
              from Android applications. It allows users to record video
              sessions and capture getevent traces while interacting with an app
              on an Android device or emulator. These traces represent the
              low-level input events generated by user actions such as taps,
              swipes, and text entries
            </p>

            <p className="text-gray-300 leading-relaxed">
              The primary purpose of AVT is to capture detailed and accurate
              user interaction data, which serves as the input for
              TraceReplayer. By recording both the visual output (video) and the
              underlying input events, AVT ensures that all user interactions
              are documented. The video is of the emulator and how the user
              interacted with it. This in-depth data collection is crucial for
              replicating user behaviors and testing the application in a
              realistic manner.
            </p>
          </section>

          <section
            ref={(el) => (contentRefs.current["instructions"] = el)}
            className="mb-8 mt-20"
          >
            <h2 className="text-4xl mb-12 font-bold text-center bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent border-b-2 border-violet-500 pb-4">
              Instructions for TraceReplayer and AVT
            </h2>
          </section>

          <section
            ref={(el) => (contentRefs.current["prerequisites"] = el)}
            className="bg-slate-900/50 rounded-xl shadow-lg p-8 mb-8 border border-violet-500/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                <FileDown className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Prerequisites
              </h2>
            </div>

            <ul className="space-y-3 text-gray-300">
              <p>Ensure you have the following:</p>

              <li className="flex items-center gap-2">
                <ChevronRight className="w-6 h-4 text-violet-400" />
                MacOS or Linux System: While AVT works with Windows,
                TraceReplayer has only been tested on MacOS and Linux systems by
                their developers
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-violet-400" />
                Latest version of Java Development Kit (JDK)
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-violet-400" />
                Android SDK: Install the Android Software Development Kit and
                set up environment variables{" "}
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-violet-400" />
                Download the trace-replayer.jar from
                <a
                  href="https://github.com/sea-lab-wm/burt/blob/tool-demo/trace-replayer/trace-replayer.jar"
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-violet-400" />
                Download the Python scripts used for TraceReplayer
                <a
                  href="https://drive.google.com/file/d/1BBdK8kOr7RY5l0Glew5-wZQQyHJmsTmf/view"
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-violet-400" />
                Download the AVT tool here:
              </li>
              <ul className="ml-6 flex flex-col gap-2">
                <ul className="ml-6 list-disc flex flex-col gap-2">
                  <li>
                    <a
                      href="https://www.dropbox.com/scl/fi/589m4tl89i05u4hnnyzn4/ACT-Mac-App.zip?rlkey=ddfw5tihosxptppcxpnui25yj&e=2&dl=0"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      MacOS (recommended)
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.dropbox.com/scl/fi/8vpkc2j5oln6pxxeq3hp5/ACT-Windows-App.zip?rlkey=boki1klg2wfcgu47jjwguxev6&e=2&dl=0"
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Windows
                    </a>
                  </li>
                </ul>
              </ul>
            </ul>
          </section>

          <section
            ref={(el) => (contentRefs.current["setup"] = el)}
            className="bg-slate-900/50 rounded-xl shadow-lg p-8 mb-8 border border-violet-500/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                <Settings className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Setting Up Android Emulator and AVT Tool
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              The AVT developers provided in-depth{" "}
              <a
                href="https://github.com/sea-lab-wm/burt/blob/tool-demo/trace-replayer/AVT-instructions.pdf"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                instructions
              </a>{" "}
              on setting up the emulator and using the AVT. These instructions
              are sufficient for users to easily follow.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-violet-500/20">
              <h3 className="font-semibold mb-4 text-violet-300">
                After setup, you should have:
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  Android emulator with correct configurations
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  AVT tool set up and ready to use with knowledge of how to use
                  it
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  Log file that will work as input for TraceReplayer
                </li>
              </ul>
            </div>

            <div className="bg-violet-900/20 border-l-4 border-violet-500 p-4 rounded-r-lg mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-violet-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-violet-200">
                  Note: If using an Apple Silicon Mac, use an arm64-v8a ABI when
                  selecting the system image.
                </p>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-2 border border-violet-500/20">
              <img
                src="https://mwll8uma09.ufs.sh/f/vHcR0snYouj7GVORftYomQTPSghC4IqV396vWYZpc1rDyXwL"
                alt="Correct system selection"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </section>

          <section
            ref={(el) => (contentRefs.current["config"] = el)}
            className="bg-slate-900/50 rounded-xl shadow-lg p-8 mb-8 border border-violet-500/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                <FileDown className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Preparing the Configuration File
              </h2>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">
              To run TraceReplayer, you must provide multiple paths in a{" "}
              <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded font-mono">
                config.yaml
              </code>{" "}
              file.
            </p>
            <p className="text-gray-300 leading-relaxed mb-6">
              Below is an example:
            </p>

            <div className="w-full max-w-2xl mb-8 mx-auto flex justify-center bg-slate-800 rounded-lg p-2 border border-violet-500/20">
              <img
                src="https://mwll8uma09.ufs.sh/f/vHcR0snYouj7FZxig1rw6G1m3KC5hUVQYzjTJBkPScLf8ZsR"
                alt="Multiple path selection"
                className="rounded-lg shadow-lg w-full"
              />
            </div>

            <div className="bg-violet-900/20 border-l-4 border-violet-500 p-4 rounded-r-lg mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-violet-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-violet-200">
                  Note: The directory name and executionNum must be the same.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-violet-500/20">
              <h3 className="font-semibold mb-4 text-violet-300">
                Required Configuration:
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">androidSDKPath:</span> The
                    absolute path of the Android SDK
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">pythonScriptsPath:</span>{" "}
                    The absolute path of the required Python scripts
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">aaptPath:</span> The
                    absolute path of the build tools version{" "}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">apkPath:</span> The absolute
                    path of the apk file{" "}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">getEventFile:</span> The
                    android getevent traces are generated using the AVT tool{" "}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-8 h-8 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">outputFolder:</span> The
                    absolute path of the output directory where the data will be
                    saved. (Make sure the name of the output folder is the
                    number of the executionNum shown below){" "}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">avdPort:</span> Port number
                    on emulator
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">adbPort:</span> Port number
                    of adb server{" "}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300 mt-1" />
                  <div>
                    <span className="font-semibold">executionNum:</span> :
                    Execution number (can be any number){" "}
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-violet-500/10 p-6 rounded-lg border border-violet-500/20">
              <p className="text-center font-bold text-violet-300 ">
                Before running TraceReplayer, ensure all data of the app has
                been wiped from the emulator. This may mean wiping all data from
                emulator and configuring the emulator again.{" "}
              </p>
            </div>
          </section>

          <section
            ref={(el) => (contentRefs.current["running"] = el)}
            className="bg-slate-900/50 rounded-xl shadow-lg p-8 mb-8 border border-violet-500/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3 bg-violet-500/10 rounded-lg text-violet-400">
                <PlayCircle className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Running TraceReplayer
              </h2>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">
              Run the following command to run trace-replayer.jar:
            </p>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-violet-500/20">
              <code className="text-violet-300 font-mono">
                java -jar trace-replayer.jar --config "path-to-config.yaml"
              </code>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-violet-500/20">
              <h3 className="font-semibold mb-4 text-violet-300">
                Execution Process:
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  TraceReplayer installs the APK on the emulator
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  It reads the getevent.log file and parses the touch events
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  The parsed events are replayed on the emulator to reproduce
                  the interactions.
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 mb-8 border border-violet-500/20">
              <h3 className="font-semibold mb-4 text-violet-300">
                Data Generation:
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  Screenshots: Captures screenshots of each interaction step.
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  Augmented Screenshots: Highlights the GUI components
                  interacted with.
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  XML Files: Saves the GUI hierarchy and app execution
                  information at each step
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-violet-300" />
                  Execution JSON: Generates a JSON file (Execution-1.json)
                  containing the execution details
                </li>
              </ul>
            </div>

            <div className="bg-violet-900/20 border-l-4 border-violet-500 p-4 rounded-r-lg mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-violet-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-violet-200">
                  Note: Allow the process to finish before interacting with the
                  emulator as that will contaminate the results produced from
                  TraceReplayer.
                </p>
              </div>
            </div>

            {/* Final Note Section */}
            <div className="bg-violet-500/10 p-6 rounded-lg border border-violet-500/20 mb-4">
              <p className="text-center font-bold text-violet-300">
                Once the TraceReplayer has finished executing, move all
                screenshots from the screenshots folder to the root folder.
              </p>
            </div>
            <p className="text-gray-300">
              All generated files are stored in the specified output folder
              given in the config.yaml file. The user will then compress their
              output directory into a zip file and upload it to the MAGNETO web
              application, where the app execution can be tested using the five
              Oracles.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialPage;
