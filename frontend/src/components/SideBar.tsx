import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SideBarLink from "./SideBarLink";
import {
  ChartBarIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  PlayIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const containerControls = useAnimationControls();
  const svgControls = useAnimationControls();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUserId = localStorage.getItem("UserId");
    const storedUsername = localStorage.getItem("firstName");
    if (storedUserId) {
      setUserId(Number(storedUserId));
    }
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/tutorial") {
      setIsOpen(false);
      containerControls.start("close");
      svgControls.start("close");
      localStorage.setItem("sidebarOpen", "false");
      window.dispatchEvent(new Event("storage"));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      containerControls.start("open");
      svgControls.start("open");
      localStorage.setItem("sidebarOpen", "true");
      window.dispatchEvent(new Event("storage"));
    } else {
      containerControls.start("close");
      svgControls.start("close");
      localStorage.setItem("sidebarOpen", "false");
      window.dispatchEvent(new Event("storage"));
    }
  }, [isOpen]);

  const handleOpenClose = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("UserId");
    localStorage.removeItem("username");
    navigate("/");
    setUserId(null);
    setUsername("");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(true);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setIsOpen(true);
  };

  const handleTutorialClick = () => {
    navigate("/tutorial");
    setIsOpen(false);
  };

  const handleGuidanceClick = () => {
    navigate("/guidance");
    setIsOpen(true);
  };

  const handleFaqClick = () => {
    navigate("/faq");
    setIsOpen(true);
  };

  const getLinkClassName = (path: string) => {
    const isActive = location.pathname === path;
    return `text-violet-500 rounded-lg transition-all duration-300 ease-in-out
      ${
        isActive
          ? "bg-violet-900/30 outline outline-2 outline-violet-500/50"
          : "hover:text-violet-400 hover:bg-violet-900/20 hover:rounded-lg"
      }`;
  };

  return (
    <motion.nav
      variants={{
        close: { width: "5rem" },
        open: { width: "16rem" },
      }}
      animate={containerControls}
      initial="open"
      className="bg-gray-900 flex-col z-10 p-5 absolute top-0 left-0 h-full border-r border-violet-900/50"
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-row w-full justify-between place-items-center">
          <motion.div
            className="flex items-center bg-gradient-to-r from-red-400 to-purple-800 rounded-lg overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            variants={{
              close: { width: "2rem", height: "2rem" },
              open: { width: "15rem", height: "3rem" },
            }}
            animate={containerControls}
            onClick={handleProfileClick}
          >
            <div className="pl-2 pr-4 py-2 text-gray-200 truncate flex items-center gap-2">
              <UserIcon className="w-8 h-8 stroke-2" />
              <span className="text-lg">
                {username ? `Hello ${username}!` : "Hello Guest"}
              </span>
            </div>
          </motion.div>
          <button
            className="p-1 rounded-full flex hover:bg-violet-900/20 transition-colors duration-300"
            onClick={handleOpenClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-8 h-8 stroke-violet-500"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{
                  close: { rotate: 360 },
                  open: { rotate: 180 },
                }}
                animate={svgControls}
                initial={{ rotate: 180 }}
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex flex-col gap-5 mt-4">
            <SideBarLink
              name="Dashboard"
              isOpen={isOpen}
              to="/dashboard"
              onClick={handleDashboardClick}
              className={getLinkClassName("/dashboard")}
            >
              <ChartBarIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
            </SideBarLink>
            <SideBarLink
              name="Traceplayer Tutorial"
              isOpen={isOpen}
              to="/tutorial"
              onClick={handleTutorialClick}
              className={getLinkClassName("/tutorial")}
            >
              <PlayIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
            </SideBarLink>
          </div>

          <div className="mt-auto flex flex-col gap-5 mb-5">
            <SideBarLink
              name="Guidance"
              isOpen={isOpen}
              to="/guidance"
              onClick={handleGuidanceClick}
              className={getLinkClassName("/guidance")}
            >
              <InformationCircleIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
            </SideBarLink>

            <SideBarLink
              name="FAQ"
              isOpen={isOpen}
              to="/faq"
              onClick={handleFaqClick}
              className={getLinkClassName("/faq")}
            >
              <QuestionMarkCircleIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
            </SideBarLink>
          </div>

          <SideBarLink
            name="Logout"
            isOpen={isOpen}
            to="/"
            onClick={handleLogout}
            className={getLinkClassName("/")}
          >
            <ArrowLeftOnRectangleIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
          </SideBarLink>
        </div>
      </div>
    </motion.nav>
  );
};

export default SideBar;
