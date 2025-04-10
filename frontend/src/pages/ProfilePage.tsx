import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
// import { Edit, Trash } from "lucide-react";
import SideBar from "../components/SideBar";
import PieDonutChart from "../components/PieDonutChart";
import OracleBarChart from "../components/OracleBarChart";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    joined: string;
  }>({
    name: "",
    email: "",
    joined: "",
  });
  const [firstName, setFirstName] = useState(
    localStorage.getItem("firstName") || ""
  );
  const [lastName, setLastName] = useState(
    localStorage.getItem("lastName") || ""
  );
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [appData, setAppData] = useState<any[]>([]);
  const pieColors = [
    "#a78bfa", // violet-400
    // "#8b5cf6", // violet-500
    "#7c3aed", // violet-600
    // "#6d28d9", // violet-700
    "#5b21b6", // violet-800
    // "#4c1d95", // violet-900
    "#c084fc", // purple-400
    // "#a855f7", // purple-500
    "#9333ea", // purple-600
    // "#7e22ce", // purple-700
    "#6b21a8", // purple-800
    // "#581c87", // purple-900
    "#e879f9", // fuchsia-400
    // "#d946ef", // fuchsia-500
    "#c026d3", // fuchsia-600
    // "#a21caf", // fuchsia-700
    "#86198f", // fuchsia-800
    // "#701a75", // fuchsia-900
    "#f472b6", // pink-400
    // "#ec4899", // pink-500
    "#db2777", // pink-600
    // "#be185d", // pink-700
    "#9d174d", // pink-800
    // "#831843", // pink-900
  ];

  const getColor = (index: number) => pieColors[index % pieColors.length];

  // const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const validatePassword = (password: string) => {
    const isStrongPassword =
      password.length >= 6 && //At least 6 characters
      /[A-Z]/.test(password) && //Contains uppercase letter
      /[a-z]/.test(password) && //Contains lowercase letter
      /\d/.test(password) && //Contains a number
      /[^A-Za-z0-9]/.test(password); //Contains special character
    setPasswordValid(isStrongPassword); //Update state based on password strength
  };

  useEffect(() => {
    const storedUsernameFirst = localStorage.getItem("firstName");
    const storedUsernameLast = localStorage.getItem("lastName");
    const storedEmail = localStorage.getItem("email");
    const storedJoined = localStorage.getItem("createdAt") || "Unknown";

    setUserProfile({
      name: `${storedUsernameFirst || "Guest"} ${storedUsernameLast || "User"}`,
      email: storedEmail || "No email available",
      joined: storedJoined,
    });

    fetchAppData();
  }, []);

  const [allTests, setAllTests] = useState<any[]>([]); // add this at the top

  const fetchAppData = async () => {
    const userId = localStorage.getItem("UserId") || "defaultFallbackId";
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No auth token found.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/app/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server responded with ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const apps = data.apps;

      const appDataPromises = apps.map(
        async (app: { _id: any; appName: any }, index: number) => {
          const testResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/test/${app._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!testResponse.ok) {
            const errorText = await testResponse.text();
            throw new Error(
              `Failed to fetch tests for app ${app._id}: ${errorText}`
            );
          }

          const testData = await testResponse.json();
          return {
            appName: app.appName,
            testCount: testData.tests.length,
            tests: testData.tests,
            color: getColor(index),
          };
        }
      );

      const result = await Promise.all(appDataPromises);
      setAppData(result);

      console.log("App data:", result);

      // Combine all tests into one array for the line chart
      const tests = result.flatMap((app) => app.tests);
      setAllTests(tests);

      console.log("All tests:", tests);
    } catch (error) {
      console.error("Error fetching app data:", error);
    }
  };

  const groupTestsByOracle = (tests: any[]) => {
    const oracleCounts: Record<string, number> = {
      "Theme Check": 0,
      "Back Button": 0,
      "User Input": 0,
      "Language Detection": 0,
    };
  
    tests.forEach((test) => {
      const oracle = test.oracleSelected;
      console.log("🔍 Found oracleSelected:", oracle); // ADD THIS
      if (oracleCounts[oracle] !== undefined) {
        oracleCounts[oracle]++;
      }
    });
  
    const structured = Object.entries(oracleCounts).map(([oracle, count]) => ({
      oracle,
      count,
    }));
  
    console.log("✅ Final grouped oracle data:", structured); // ADD THIS TOO
    return structured;
  };
  
  

  useEffect(() => {
    validatePassword(newPassword);
  }, [newPassword]);

  const handleEditName = () => {
    setIsEditingName(true);
    setTimeout(() => {
      firstNameInputRef.current?.focus();
    }, 0);
  };

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("First and Last name cannot be empty.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found.");
      return;
    }

    try {
      // Format first and last names
      const formattedFirstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const formattedLastName =
        lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/update-name`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formattedFirstName,
            lastName: formattedLastName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update name: ${response.status}`);
      }

      // Save to local storage and update user profile state
      localStorage.setItem("firstName", formattedFirstName);
      localStorage.setItem("lastName", formattedLastName);

      // Update userProfile state with formatted names
      setUserProfile({
        ...userProfile,
        name: `${formattedFirstName} ${formattedLastName}`,
      });

      window.dispatchEvent(new Event("userUpdated"));
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (!passwordValid) {
      setPasswordError("Password does not meet complexity requirements.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setPasswordError("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If error is from the backend
        if (data.error === "Incorrect old password.") {
          setPasswordError("The old password you entered is incorrect.");
        } else {
          setPasswordError("An unexpected error occurred. Please try again.");
        }
      } else {
        setPasswordSuccess(data.message || "Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status}`);
      }

      alert("Account deleted successfully.");
      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete your account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950">
      <SideBar />
      <div className="ml-64 p-10 max-w-full mx-auto space-y-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-800">
              User Profile
            </h1>
          </div>
        </div>

        <div
          className="overflow-y-auto space-y-5 h-[calc(100vh-150px)]"
          style={{ marginTop: "10px" }}
        >
          {/* Personal Info Section */}
          <div className="bg-gray-900 p-6 rounded-xl border border-violet-900 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl text-gray-300">Personal Info</h2>
              <button
                onClick={isEditingName ? handleSaveName : handleEditName}
                className="px-4 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-white rounded-lg"
              >
                {isEditingName ? "Save" : "Edit"}
              </button>
            </div>
            <div
              className="grid grid-cols-2 gap-4"
              style={{ paddingLeft: "30px" }}
            >
              <div>
                <p className="text-gray-400 mb-1">First Name</p>
                <input
                  ref={firstNameInputRef}
                  type="text"
                  value={`${
                    firstName.charAt(0).toUpperCase() +
                    firstName.slice(1).toLowerCase()
                  }`}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  disabled={!isEditingName}
                  style={{ paddingLeft: "2.5px" }}
                  className={`w-full p-2 bg-transparent text-gray-200 text-lg ${
                    isEditingName
                      ? "text-lg text-gray-400 bg-gray-800 border border-violet-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      : ""
                  }`} // Add border when editing
                />
              </div>
              <div>
                <p className="text-gray-400 mb-1">Last Name</p>
                <input
                  type="text"
                  value={`${
                    lastName.charAt(0).toUpperCase() +
                    lastName.slice(1).toLowerCase()
                  }`}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  disabled={!isEditingName}
                  style={{ paddingLeft: "2.5px" }}
                  className={`w-full p-2 bg-transparent text-gray-200 text-lg ${
                    isEditingName
                      ? "text-lg text-gray-400 bg-gray-800 border border-violet-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      : ""
                  }`} // Add border when editing
                />
              </div>
              <div>
                <p className="text-gray-400 mb-1">Email</p>
                <p
                  className="text-gray-200 text-lg"
                  style={{ paddingLeft: "2.5px" }}
                >
                  {userProfile.email}
                </p>{" "}
                {/* Increased font size */}
              </div>
              <div>
                <p className="text-gray-400 mb-1">Date Joined</p>
                <p
                  className="text-gray-200 text-lg"
                  style={{ paddingLeft: "2.5px" }}
                >
                  {userProfile.joined}
                </p>{" "}
                {/* Increased font size */}
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-gray-900 p-6 rounded-xl border border-violet-900">
            <h2 className="text-xl text-gray-300 mb-4">Insights</h2>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-8">
              {allTests.length > 0 ? (
                <OracleBarChart data={groupTestsByOracle(allTests)} />
              ) : (
                <p className="text-gray-400">Loading Oracle Chart...</p>
              )}
            {appData.length > 0 ? (
              <PieDonutChart data={appData} />
            ) : (
              <p className="text-gray-400">Loading...</p>
            )}
          </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-gray-900 p-6 rounded-xl border border-violet-900">
            <h2 className="text-xl text-gray-300 mb-4">Change Password</h2>
            <div
              className="grid grid-cols-2 gap-6"
              style={{ paddingLeft: "5%" }}
            >
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-gray-300 border border-violet-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-gray-300 border border-violet-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-gray-300 border border-violet-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={
                    !oldPassword ||
                    !passwordValid ||
                    newPassword !== confirmNewPassword
                  }
                  className={`w-full py-2 rounded-lg text-white transition-opacity ${
                    oldPassword &&
                    passwordValid &&
                    newPassword === confirmNewPassword
                      ? "bg-gradient-to-r from-red-400 to-purple-800 hover:opacity-90"
                      : "bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  Change Password
                </button>
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-green-500 text-sm">{passwordSuccess}</p>
                )}
              </div>
              <ul
                className="text-lg text-gray-400 space-y-2"
                style={{ paddingLeft: "10%" }}
              >
                <li
                  className={
                    newPassword.length >= 6 ? "text-green-500" : "text-gray-400"
                  }
                >
                  <span className="text-xl">✔</span> At least 6 characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(newPassword)
                      ? "text-green-500"
                      : "text-gray-400"
                  }
                >
                  <span className="text-xl">✔</span> Contains uppercase letter
                </li>
                <li
                  className={
                    /[a-z]/.test(newPassword)
                      ? "text-green-500"
                      : "text-gray-400"
                  }
                >
                  <span className="text-xl">✔</span> Contains lowercase letter
                </li>
                <li
                  className={
                    /\d/.test(newPassword) ? "text-green-500" : "text-gray-400"
                  }
                >
                  <span className="text-xl">✔</span> Contains a number
                </li>
                <li
                  className={
                    /[^A-Za-z0-9]/.test(newPassword)
                      ? "text-green-500"
                      : "text-gray-400"
                  }
                >
                  <span className="text-xl">✔</span> Contains special character
                </li>
                <li
                  className={
                    newPassword === confirmNewPassword && newPassword !== ""
                      ? "text-green-500"
                      : "text-gray-400"
                  }
                >
                  <span className="text-xl">✔</span> Passwords match
                </li>
              </ul>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="bg-red-950 p-6 rounded-xl border border-red-800">
            <h2 className="text-xl text-red-400 mb-2">Delete User Account</h2>
            <p className="text-sm text-red-300 mb-4">
              Permanently remove your account and all its data. This action is
              not reversible. Type <strong>DELETE MY ACCOUNT</strong> to
              confirm.
            </p>
            <input
              type="text"
              placeholder="Type DELETE MY ACCOUNT to confirm"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="w-full p-2 bg-gray-800 text-red-300 border border-red-700 rounded-lg mb-4"
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleteText !== "DELETE MY ACCOUNT"}
              className={`w-full py-2 rounded-lg text-white ${
                deleteText === "DELETE MY ACCOUNT"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
            >
              Delete Account
            </button>
          </div>
        </div>
        {/* Add the style block here */}
        <style>{`
          .overflow-y-auto {
            overflow-y: scroll; /* Keep the section scrollable */
            -ms-overflow-style: none;  /* For Internet Explorer 10+ */
            scrollbar-width: none;  /* For Firefox */
          }

          .overflow-y-auto::-webkit-scrollbar {
            display: none; /* Hide the scrollbar in WebKit browsers (Chrome, Safari, Opera) */
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProfilePage;
