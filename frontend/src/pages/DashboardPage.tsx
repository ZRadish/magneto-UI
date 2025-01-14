import React from "react";
import SideBar from "../components/SideBar";

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <SideBar />
      <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-600 mt-4">
        This is your dashboard. Content goes here.
      </p>
    </div>
  );
};

export default DashboardPage;
