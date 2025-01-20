import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

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

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    const navHeight = 80;
    const elementPosition = ref.current?.getBoundingClientRect().top || 0;
    const offsetPosition = elementPosition + window.scrollY - navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  const oracles = [
    {
      title: "Language Detection",
      image: "",
      body: "The language detection oracle tests whether an application correctly changes the language displayed after the user selects a different language. It does this by analyzing all the screens that come after the language change. It extracts texts from the screen, detects the language of the text, and compares it with the language the user selected. It then reports whether the application has successfully changed the language on all those screens. ",
    },
    {
      title: "Back Button",
      image: "",
      body: "The back button oracles tests the behavior of back buttons with an application. The primary objective of the oracle is to verify if the application responds correctly when a back button is pressed by a user. To do this, it compares screenshots of the application’s state before and after the back button is pressed using the Structural Similarity Index (SSIM). In addition, it analyzes the consistency of text to make sure the back button does not cause any change in language or change the text on the screen.",
    },
    {
      title: "Theme Change",
      image: "",
      body: "The theme change oracle checks if the application successfully updates all the pages of an app when a theme change is detected. It checks if all the UI elements are updated correctly to the new theme and in a consistent way. The overall purpose of it is to assess whether the new theme is correctly applied to all elements and pages.",
    },
    {
      title: "User Input",
      image: "",
      body: "The user input oracle is designed to test how mobile apps handle user inputs and interactions, while making sure that the inputs entered by users, such as text in forms, are correctly reflected on subsequent screens after certain trigger events (like clicking a button). This oracle works by analyzing the sequence of actions a user takes in the app and comparing what the user inputs with what is displayed after a trigger event occurs.",
    },
  ];

  const aboutItems = [
    {
      title: "Hashim AlKhateeb",
      role: "text",
      image: "",
      linkedin: "",
    },
    {
      title: "Malak Elsayed",
      role: "text",
      image: "",
      linkedin: "",
    },
    {
      title: "Zahrah Rashid",
      role: "text",
      image: "",
      linkedin: "https://www.linkedin.com/in/zahrah-rashid/",
    },
    {
      title: "Dina Kazzoun",
      role: "text",
      image: "",
      linkedin: "",
    },
    {
      title: "Aisha Fathalla",
      role: "text",
      image: "",
      linkedin: "",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-sm shadow-sm z-50 border-b border-purple-800">
        <div className="relative flex items-center h-24">
          {/* Left section: MAGNETO */}
          <div className="absolute left-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
              MAGNETO
            </h1>
          </div>

          {/* Center section: What is MAGNETO, Oracles, About Us */}
          <div className="flex-1 flex justify-center space-x-12">
            <button
              onClick={() => scrollToSection(magnetoRef)}
              className="text-gray-400 hover:text-violet-500 transition-colors"
            >
              What is MAGNETO
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
              className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
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
          {/* Hero Section */}
          <section
            ref={magnetoRef}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            <h1 className="text-8xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-36">
              MAGNETO
            </h1>
          </section>

          {/* Oracles Section */}
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
              <div className="border border-violet-900 rounded-lg p-6 mb-8 hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  {oracles.map((oracle, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 rounded-lg shadow-sm hover:shadow-lg hover:shadow-violet-900/50 transition-all duration-300 p-4 hover:scale-105"
                    >
                      <img
                        className="w-full h-32 object-cover rounded-md mb-4"
                        src="https://via.placeholder.com/150"
                        alt={`Oracle ${index + 1}`}
                      />
                      <h3 className="font-bold mb-2 text-violet-500">
                        {oracle.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {oracle.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* About Us Section */}
          <section
            ref={aboutUsRef}
            className="flex flex-col items-center py-20 w-full"
          >
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Meet Our Team
              </h2>
            </div>

            <div className="w-full max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-8">
                {aboutItems.map((item, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-6 hover:bg-gray-900 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <a
                          href={item.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-40 h-40 rounded-full overflow-hidden ring-2 ring-violet-600/20 group-hover:ring-violet-600/40 transition-all duration-300"
                        >
                          {item.image && (
                            <img
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                              src={item.image}
                              alt={`${item.title}'s headshot`}
                            />
                          )}
                        </a>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-violet-500">
                          {item.title}
                        </h3>
                        <p className="text-violet-400 font-medium">
                          {item.role}
                        </p>
                      </div>
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
