import React from "react";
import { ChevronRight } from "lucide-react";

const TutorialPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 h-screen sticky top-0 overflow-auto border-r border-gray-200 bg-gray-50">
          {/* Table of Contents */}
          <nav className="p-4">
            <div className="text-sm font-medium text-gray-900 py-2">
              Table of Contents
            </div>
            <a
              href="#what-is"
              className="block py-1.5 text-gray-700 hover:bg-gray-100 rounded px-2"
            >
              What is TraceReplayer
            </a>
            <a
              href="#why-use"
              className="block py-1.5 text-gray-700 hover:bg-gray-100 rounded px-2 ml-4"
            >
              Why Use TraceReplayer
            </a>
            <a
              href="#prerequisites"
              className="block py-1.5 text-gray-700 hover:bg-gray-100 rounded px-2"
            >
              Prerequisites
            </a>
            <a
              href="#setup"
              className="block py-1.5 text-gray-700 hover:bg-gray-100 rounded px-2"
            >
              Setting Up Android Emulator
            </a>
            <a
              href="#config"
              className="block py-1.5 text-gray-700 hover:bg-gray-100 rounded px-2"
            >
              Configuration
            </a>
            <a
              href="#running"
              className="block py-1.5 text-gray-700 hover:bg-gray-100 rounded px-2"
            >
              Running TraceReplayer
            </a>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-xl font-semibold">
              Generating Input for MAGNETO
            </h1>
          </header>

          {/* Content */}
          <main className="max-w-4xl mx-auto p-8">
            <div className="space-y-8">
              {/* What is TraceReplayer section */}
              <section id="what-is">
                <h2 className="text-2xl font-bold mb-4">
                  What is TraceReplayer
                </h2>
                <p className="text-gray-600 mb-4">
                  TraceReplayer is a tool that processes human-generated
                  interaction traces and converts them into an appropriate
                  format compatible with MAGNETO.
                </p>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="font-semibold mb-3">
                    TraceReplayer generates:
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mt-1 mr-2 text-blue-500" />
                      <span>
                        Execution JSON file containing detailed executions steps
                        and metadata
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mt-1 mr-2 text-blue-500" />
                      <div>
                        <p>Screenshots:</p>
                        <ul className="ml-4 mt-1">
                          <li>
                            - Base Screenshot: Unedited screenshot of step
                          </li>
                          <li>
                            - Augmented Screenshot: Displays user interaction
                          </li>
                          <li>
                            - GUI Screenshot: PNG of the GUI element interacted
                            with
                          </li>
                        </ul>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 mt-1 mr-2 text-blue-500" />
                      <span>
                        XML files containing GUI hierarchies and execution
                        information
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Example Screenshots */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Original Screenshot</h4>
                    <img
                      src="/api/placeholder/400/300"
                      alt="Original Screenshot"
                      className="rounded-lg border border-gray-200 w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Augmented Screenshot</h4>
                    <img
                      src="/api/placeholder/400/300"
                      alt="Augmented Screenshot"
                      className="rounded-lg border border-gray-200 w-full"
                    />
                  </div>
                </div>
              </section>

              {/* Prerequisites section */}
              <section
                id="prerequisites"
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🖥️</span>
                    </div>
                    <div>
                      <h3 className="font-medium">System Requirements</h3>
                      <p className="text-sm text-gray-600">
                        macOS or Linux System
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">⚙️</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Development Tools</h3>
                      <p className="text-sm text-gray-600">
                        Latest Java Development Kit (JDK)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Android SDK</h3>
                      <p className="text-sm text-gray-600">
                        Android Software Development Kit with environment
                        variables
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Configuration section */}
              <section
                id="config"
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <h2 className="text-2xl font-bold mb-4">Configuration</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                    androidSDKPath: /path/to/android-sdk{"\n"}
                    pythonScriptsPath: /path/to/scripts{"\n"}
                    aaptPath: /path/to/build-tools{"\n"}
                    apkPath: /path/to/app.apk{"\n"}
                    avdPort: 5554{"\n"}
                    adbPort: 5037
                  </pre>
                </div>
              </section>

              {/* Important Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-yellow-600">⚠️</div>
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      Important Note
                    </h4>
                    <p className="text-yellow-700">
                      Allow the process to finish before interacting with the
                      emulator as that will contaminate the results produced
                      from TraceReplayer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
