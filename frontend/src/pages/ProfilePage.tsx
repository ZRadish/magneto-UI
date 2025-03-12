import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash, Lock } from "lucide-react";
import SideBar from "../components/SideBar";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState(localStorage.getItem("firstName") || "");
  const [lastName, setLastName] = useState(localStorage.getItem("lastName") || "");
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");



  useEffect(() => {
    // Retrieve user details from local storage
    const storedUsernameFirst = localStorage.getItem("firstName");
    const storedUsernameLast = localStorage.getItem("lastName");
    const storedEmail = localStorage.getItem("email");

    setUserProfile({
      name: `${storedUsernameFirst || "Guest"} ${storedUsernameLast || "User"}`,
      email: storedEmail || "No email available",
    });
  }, []);

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication token not found");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.status}`);
      }

      alert("Account deleted successfully.");
      localStorage.removeItem("authToken"); // Clear authentication token
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete your account. Please try again.");
    }
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setTimeout(() => {
        firstNameInputRef.current?.focus(); // Auto-focus on first name field
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/update-name`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update name: ${response.status}`);
        }

        const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const formattedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

        // Update local storage & UI
        localStorage.setItem("firstName", formattedFirstName);
        localStorage.setItem("lastName", formattedLastName);
        setUserProfile({ name: `${formattedFirstName} ${formattedLastName}`, email: userProfile.email });

        window.dispatchEvent(new Event("userUpdated")); // Trigger event listener in SideBar.tsx
        
        setIsEditingName(false);
    } catch (error) {
        console.error("Error updating name:", error);
        alert("Failed to update name. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setFirstName(localStorage.getItem("firstName") || "");
    setLastName(localStorage.getItem("lastName") || "");
    setIsEditingName(false);
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
  
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
  
    const token = localStorage.getItem("authToken");
    if (!token) {
      setPasswordError("Authentication token not found.");
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          setPasswordError("Incorrect old password.");
        } else {
          throw new Error(`Failed to update password: ${response.status}`);
        }
        return;
      }
  
      setPasswordSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
  
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Failed to update password. Please try again.");
    }
  };
  



  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950">
      <SideBar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-2">
              Profile
            </h1>
            <h2 className="text-xl font-semibold text-gray-400">
              User Information:
            </h2>
          </div>
          {isEditingName ? (
              <div className="flex gap-3">
                  <button
                      onClick={handleSaveName}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  >
                      Save
                  </button>
                  <button
                      onClick={handleCancelEdit}
                      className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                  >
                      Cancel
                  </button>
              </div>
          ) : (
              <button
                  id="edit-profile-btn"
                  onClick={handleEditName}
                  className="px-6 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                  <Edit size={20} />
                  <span>Edit Profile</span>
              </button>
          )}

        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 p-6 rounded-lg border border-violet-900">
            <h3 className="text-xl font-semibold text-gray-400">Personal Info</h3>
            <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2">
                {isEditingName ? (
                    <>
                    <p className="text-gray-400">
                        <strong>Name: </strong>
                    </p>
                        <input
                            ref={firstNameInputRef}
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                            className="bg-gray-800 text-gray-300 border border-violet-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                            className="bg-gray-800 text-gray-300 border border-violet-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </>
                ) : (
                    <p className="text-gray-400">
                        <strong>Name: </strong> {userProfile.name}
                    </p>
                )}
            </div>
              <p className="text-gray-400">
                <strong>Email: </strong> {userProfile.email}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <Lock size={20} />
              <span>Change Password</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <Trash size={20} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full border border-violet-900">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-4">
                Change Password
              </h2>

              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-gray-300 rounded-lg border border-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-gray-300 rounded-lg border border-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-gray-300 rounded-lg border border-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {passwordError && <p className="text-sm text-red-500 mt-2">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm text-green-500 mt-2">{passwordSuccess}</p>}

              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Change Password
                </button>
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full border border-violet-900">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-4">
                Are you sure you want to delete your account?
              </h2>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;