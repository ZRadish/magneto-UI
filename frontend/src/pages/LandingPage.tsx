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
    { title: "Oracle 1", body: "some text" },
    { title: "Oracle 2", body: "some text" },
    { title: "Oracle 3", body: "some text" },
  ];

  const dualOracles = [
    { title: "Oracle 4", body: "some text" },
    { title: "Oracle 5", body: "some text" },
  ];

  const aboutItems = [
    {
      title: "Person 1",
      role: "role",
      image: "",
      linkedin: "https://www.linkedin.com",
    },
    {
      title: "Person 2",
      role: "role",
      // image: "headshot_someone",
      // // linkedin: "https://www.linkedin.com
    },
    {
      title: "Person 3",
      role: "role",
      // image: "headshot_someone",
      // // linkedin: "https://www.linkedin.com",
    },
    {
      title: "Person 4",
      role: "role",
      // image: "headshot_someone",
      // // linkedin: "https://www.linkedin.com",
    },
    {
      title: "Person 5",
      role: "role",
      // image:"headshot_someone",
      // // linkedin: "https://www.linkedin.com",
    },
    {
      title: "Person 6",
      role: "role",
      // image:"headshot_someone",
      // // linkedin: "https://www.linkedin.com",
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
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Oracles
              </h2>
              <p className="text-gray-400">Subheading</p>
            </div>
            <div className="w-full max-w-6xl">
              <div className="border border-violet-900 rounded-lg p-6 mb-8 hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div className="border border-violet-900 rounded-lg p-6 hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dualOracles.map((oracle, index) => (
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
            className="flex flex-col items-center pb-40 pt-10 w-full"
          >
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent">
                Meet Our Team
              </h2>
              <p className="text-gray-400">Subheading</p>
            </div>

            <div className="w-full max-w-6xl">
              <div className="border border-violet-900 rounded-lg p-6 hover:border-violet-700 transition-colors hover:shadow-lg hover:shadow-violet-900/50">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {aboutItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 rounded-lg shadow-sm hover:shadow-lg hover:shadow-violet-900/50 transition-all duration-300 p-4 hover:scale-105"
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
                          <h3 className="font-bold mb-2 text-violet-500">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
