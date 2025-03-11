import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Aisha_headshot from "../components/vids&imgs/Aisha_headshot.avif";
import Hashim_headshot from "../components/vids&imgs/Hashim_headshot.jpg";
import Dina_headshot from "../components/vids&imgs/Dina_headshot.avif";
import Malak_headshot from "../components/vids&imgs/Malak_headshot.jpg";
import Zahrah_headshot from "../components/vids&imgs/Zahrah_headshot.jpg";
import PerformanceMetrics from "../components/PerformanceMetrics";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const oraclesRef = useRef<HTMLDivElement>(null);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const magnetoRef = useRef<HTMLDivElement>(null);
  const whatIsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return;

    const navHeight = 80;

    const elementPosition =
      ref.current.getBoundingClientRect().top + window.pageYOffset;

    const offsetPosition = elementPosition - navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };
  const oracles = [
    {
      title: "Language Detection",
      body: "This oracle ensures that an application correctly updates all interface elements to reflect the user's selected language. It analyzes screens following a language change, extracts and verifies displayed text, and determines whether the transition is consistent and accurate across the entire application. ",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-violet-500 mb-4 mx-auto"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12h20M12 2v20M4.5 9.5l3 3M16.5 9.5l3 3M16.5 14.5l3-3M4.5 14.5l3-3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      title: "Back Button",
      body: "This oracle evaluates how an application handles back button interactions, ensuring that navigation functions as expected. It compares the app’s state before and after the back button is pressed using the Structural Similarity Index (SSIM) and checks for unintended changes in text or language consistency.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-violet-500 mb-4 mx-auto"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      ),
    },
    {
      title: "Theme Change",
      body: "This oracle verifies that an application's theme settings are applied uniformly across all pages and UI elements. It detects inconsistencies in styling after a theme switch and ensures that visual elements are updated correctly to maintain a seamless user experience.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-violet-500 mb-4 mx-auto"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ),
    },
    {
      title: "User Input",
      body: "This oracle assesses whether user inputs, such as text entered into forms, are correctly processed and retained throughout an application. It examines interactions before and after trigger events (e.g., button presses) to confirm that input data is accurately displayed and maintained.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-violet-500 mb-4 mx-auto"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
          <line x1="2" y1="20" x2="22" y2="20" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="7" y1="8" x2="17" y2="8" />
        </svg>
      ),
    },
  ];

  const aboutItems1 = [
    {
      title: "Hashim AlKhateeb",
      role: "PM / Backend",
      image: Hashim_headshot,
      linkedin: "https://www.linkedin.com/in/hashim-alkhateeb/",
    },
    {
      title: "Dina Kazzoun",
      role: "Backend / DB / API",
      image: Dina_headshot,
      linkedin: "https://www.linkedin.com/in/dina-kazzoun-b44a9419a/",
    },
    {
      title: "Aisha Fathalla",
      role: "Backend / ScrumMaster",
      image: Aisha_headshot,
      linkedin: "https://www.linkedin.com/in/aisha-fathalla/",
    },
  ];

  const aboutItems2 = [
    {
      title: "Zahrah Rashid",
      role: "Frontend",
      image: Zahrah_headshot,
      linkedin: "https://www.linkedin.com/in/zahrah-rashid/",
    },
    {
      title: "Malak Elsayed",
      role: "Frontend",
      image: Malak_headshot,
      linkedin: "https://www.linkedin.com/in/malak-elsayed-1b1868259/",
    },
  ];

  const handleMagnetoClick = () => {
    setTimeout(() => {
      scrollToSection(magnetoRef);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-sm shadow-sm z-50 border-b border-purple-800">
        <div className="relative flex items-center h-24">
          {/* Left section: MAGNETO */}
          <div className="absolute left-6">
            <button
              onClick={handleMagnetoClick}
              className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent"
            >
              MAGNETO-UI
            </button>{" "}
          </div>

          {/* Center section: What is MAGNETO, Oracles, About Us */}
          <div className="flex-1 flex justify-center space-x-12">
            <button
              onClick={() => scrollToSection(whatIsRef)}
              className="text-gray-400 hover:text-violet-500 transition-colors"
            >
              What is MAGNETO-UI
            </button>
            <button
              onClick={() => scrollToSection(oraclesRef)}
              className="text-gray-400 hover:text-violet-500  transition-colors"
            >
              Oracles
            </button>
            <button
              onClick={() => scrollToSection(aboutUsRef)}
              className="text-gray-400 hover:text-violet-500 transition-colors"
            >
              About Us
            </button>
          </div>

          {/* Right section: Login, Sign Up */}
          <div className="absolute right-6 flex space-x-2">
            <button
              onClick={handleLoginClick}
              className="px-4 py-2 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
            <button
              onClick={handleSignupClick}
              className="px-4 py-2 bg-gradient-to-r from-red-500 via-purple-600 to-purple-900 text-white rounded-full transition-transform duration-200 transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        {/* Add padding-top to account for fixed navbar */}
        <div className="pt-24">
          {/* Hero Section - Headers */}
          <section
            ref={magnetoRef}
            className="flex flex-col items-center justify-center min-h-screen py-20"
          >
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-8xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-8">
                MAGNETO-UI
              </h1>

              <p className="text-2xl text-violet-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Revolutionizing Mobile App Testing – Faster, Smarter, Automated
              </p>

              <div className="mt-12">
                <button
                  onClick={handleSignupClick}
                  className="px-10 py-4 bg-gradient-to-r from-red-500 via-purple-600 to-purple-900 text-white rounded-full hover:shadow-2xl transition-all duration-200 text-lg font-semibold shadow-md transform hover:scale-105 hover:shadow-black"
                >
                  Try MAGNETO-UI
                </button>
              </div>
            </div>
          </section>

          {/* What is Magneto-UI Section */}
          <section ref={whatIsRef} className="py-20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                  What is MAGNETO-UI
                </h2>
              </div>

              <div className="border border-violet-900 rounded-lg p-8 bg-gray-900/50 backdrop-blur-sm shadow-lg hover:shadow-violet-900/30 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="text-left space-y-6">
                    <p className="text-gray-300 leading-relaxed">
                      MAGNETO-UI is an advanced testing framework designed to
                      detect and analyze UI inconsistencies in mobile
                      applications. Our innovative approach uses specialized AI
                      oracles to verify application behavior across different
                      states and interactions.
                    </p>
                  </div>
                </div>

                {/* Performance Metrics Section */}
                <PerformanceMetrics />

                {/* User Benefits Section */}
                <div className="mt-10 pt-8 border-t border-violet-900/50">
                  <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-6">
                    User Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-left">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-violet-500 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-300">
                          <span className="font-semibold text-violet-300">
                            Faster Testing:
                          </span>{" "}
                          Automates UI failure detection, reducing manual effort
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-violet-500 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-300">
                          <span className="font-semibold text-violet-300">
                            Reliable Results:
                          </span>{" "}
                          Low false positives ensure accurate reporting
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-violet-500 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-300">
                          <span className="font-semibold text-violet-300">
                            Comprehensive Testing:
                          </span>{" "}
                          Covers a wide range of GUI-based failures
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-violet-500 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-300">
                          <span className="font-semibold text-violet-300">
                            Easy Integration:
                          </span>{" "}
                          Works alongside existing test automation tools
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-violet-500 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-300">
                          <span className="font-semibold text-violet-300">
                            Improved Software Quality:
                          </span>{" "}
                          Detects failures that traditional methods might miss
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-violet-500 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-300">
                          <span className="font-semibold text-violet-300">
                            Actionable Insights:
                          </span>{" "}
                          Provides detailed failure reports to help developers
                          quickly identify and fix issues
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Oracles Section with Directional Hover Tooltips */}
          <section
            ref={oraclesRef}
            className="flex flex-col items-center mb-16 pt-14"
          >
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Oracles
              </h2>
            </div>
            <div className="w-full max-w-6xl">
              <div className="border border-violet-900 rounded-lg p-6 mb-8 transition-colors hover:shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
                  {oracles.map((oracle, index) => (
                    <div
                      key={index}
                      className="relative bg-gray-900 rounded-lg shadow-sm hover:shadow-lg hover:shadow-violet-900/50 transition-all duration-300 p-6 group text-center h-64"
                    >
                      {/* Icon instead of image */}
                      <div className="flex flex-col items-center justify-center h-full">
                        {oracle.icon}

                        <h3 className="font-bold text-xl mb-4 text-violet-500">
                          {oracle.title}
                        </h3>

                        {/* Short summary instead of full description */}
                        <p className="text-gray-400 text-m leading-relaxed">
                          {oracle.title === "Language Detection" &&
                            "Verifies if the app correctly updates all screens to the selected language."}
                          {oracle.title === "Back Button" &&
                            "Ensures the app properly navigates back without altering text or language."}
                          {oracle.title === "Theme Change" &&
                            "Checks if the app applies the new theme consistently across all pages."}
                          {oracle.title === "User Input" &&
                            "Confirms that user inputs persist correctly after trigger events."}
                        </p>
                      </div>

                      {/* Tooltip with full description - appears on hover */}
                      <div
                        className={`absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-10 
                w-80 bg-gray-900/95 text-gray-200 p-5 rounded-lg border border-violet-700 shadow-lg shadow-violet-900/40
                ${
                  index % 2 === 0
                    ? "right-full mr-4 top-0" // Left side boxes - tooltip appears on the left
                    : "left-full ml-4 top-0" // Right side boxes - tooltip appears on the right
                }`}
                      >
                        {/* Triangle pointer - FIXED */}
                        <div
                          className={`absolute w-4 h-4 bg-gray-900 transform top-8
                      ${
                        index % 2 === 0
                          ? "right-0 translate-x-2 border-t border-r border-violet-700 rotate-45" // Left side boxes - triangle points right
                          : "left-0 -translate-x-2 border-b border-l border-violet-700 rotate-45" // Right side boxes - triangle points left
                      }`}
                        ></div>

                        <h4 className="font-bold text-xl bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-3">
                          {oracle.title}
                        </h4>
                        <p className="text-gray-300 text-sm">{oracle.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* About Us */}
          <section
            ref={aboutUsRef}
            className="flex flex-col items-center py-20 w-full"
          >
            <div className="text-center max-w-2xl mx-auto mb-">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-4">
                Meet Our Team
              </h2>
            </div>

            <div className="w-full max-w-5xl">
              {" "}
              {/* reduced from max-w-6xl to max-w-5xl */}
              {/* First row with 3 people */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {" "}
                {/* reduced gap-8 to gap-6 and mb-8 to mb-6 */}
                {aboutItems1.map((member, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-4 hover:bg-gray-800 transition-all duration-300 flex flex-col items-center text-center hover:shadow-lg hover:shadow-violet-900/30"
                    // reduced p-6 to p-4
                  >
                    <div className="mb-4">
                      {" "}
                      {/* reduced mb-6 to mb-4 */}
                      <a
                        href={member.linkedin || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-36 h-36 rounded-full overflow-hidden ring-2 ring-violet-600/30 group-hover:ring-violet-500/60 transition-all duration-300"
                        // reduced w-44 h-44 to w-36 h-36
                      >
                        {member.image && (
                          <img
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            src={member.image}
                            alt={`${member.title}'s headshot`}
                          />
                        )}
                      </a>
                    </div>
                    <div className="space-y-2">
                      {" "}
                      {/* reduced space-y-3 to space-y-2 */}
                      <h3 className="text-lg font-bold text-violet-400 group-hover:text-violet-300">
                        {/* reduced text-xl to text-lg */}
                        {member.title}
                      </h3>
                      <p className="text-violet-500/80 font-medium">
                        {member.role}
                      </p>
                      {member.linkedin && (
                        <div className="pt-1">
                          {" "}
                          {/* reduced pt-2 to pt-1 */}
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-gray-400 hover:text-violet-400 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-1"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            Connect
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Second row with 2 people - centered */}
              <div className="flex justify-center gap-6">
                {" "}
                {/* reduced gap-8 to gap-6 */}
                {aboutItems2.map((member, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-4 hover:bg-gray-800 transition-all duration-300 flex flex-col items-center text-center hover:shadow-lg hover:shadow-violet-900/30 w-full max-w-xs"
                    // reduced p-6 to p-4
                  >
                    <div className="mb-4">
                      {" "}
                      {/* reduced mb-6 to mb-4 */}
                      <a
                        href={member.linkedin || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-36 h-36 rounded-full overflow-hidden ring-2 ring-violet-600/30 group-hover:ring-violet-500/60 transition-all duration-300"
                        // reduced w-44 h-44 to w-36 h-36
                      >
                        {member.image && (
                          <img
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            src={member.image}
                            alt={`${member.title}'s headshot`}
                          />
                        )}
                      </a>
                    </div>
                    <div className="space-y-2">
                      {" "}
                      {/* reduced space-y-3 to space-y-2 */}
                      <h3 className="text-lg font-bold text-violet-400 group-hover:text-violet-300">
                        {/* reduced text-xl to text-lg */}
                        {member.title}
                      </h3>
                      <p className="text-violet-500/80 font-medium">
                        {member.role}
                      </p>
                      {member.linkedin && (
                        <div className="pt-1">
                          {" "}
                          {/* reduced pt-2 to pt-1 */}
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-gray-400 hover:text-violet-400 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-1"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            Connect
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
