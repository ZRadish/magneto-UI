import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Edit, Trash } from "lucide-react";
import SideBar from "../components/SideBar";

interface UserProfile {
  name: string;
  email: string;
  notes: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "johndoe@example.com",
    notes: "This is a user profile page.",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editableNotes, setEditableNotes] = useState(userProfile.notes);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleSaveProfile = () => {
    setUserProfile((prev) => ({ ...prev, notes: editableNotes }));
    setIsEditing(false);
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
      localStorage.removeItem("authToken"); // Clear authentication token
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete your account. Please try again.");
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
          <button
            id="edit-profile-btn"
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Edit size={20} />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 p-6 rounded-lg border border-violet-900">
            <h3 className="text-xl font-semibold text-gray-400">
              Personal Info
            </h3>
            <div className="space-y-2 mt-4">
              <p className="text-gray-400">
                <strong>Name: </strong> {userProfile.name}
              </p>
              <p className="text-gray-400">
                <strong>Email: </strong> {userProfile.email}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-violet-900 mt-4">
            <h3 className="text-xl font-semibold text-gray-400">Notes</h3>
            <div className="mt-4">
              {isEditing ? (
                <textarea
                  id="profile-notes"
                  className="w-full h-40 bg-gray-800 text-gray-300 p-4 rounded-lg border border-violet-900 focus:border-violet-700 focus:outline-none resize-none"
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                />
              ) : (
                <p className="text-gray-400">{userProfile.notes}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-4 flex justify-end gap-4">
              <button
                id="save-profile-btn"
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                onClick={handleSaveProfile}
              >
                <Save size={16} />
                Save Profile
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <Trash size={20} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

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
