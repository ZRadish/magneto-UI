import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import api from "../utils/api.ts";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isLoading = false;
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Name:", email);
    try {
      const response = await api.post("/user/login", {
        email,
        password,
        isVerified: false, // Set default value
      });

      console.log("API Response Data:", response.data);

      const data = response.data;
      const { user } = response.data || {};

      const userId = user.id;
      const username = user.firstName;
      if (data.error) {
        setError(data.error);
      } else {
        // Handle successful registration (e.g., redirect to login or show success message)
        localStorage.setItem("UserId", userId);
        console.log("Logged in User ID:", userId);
        localStorage.setItem("username", username);
        console.log("Logged in username:", username);
        console.log("Login successful:");
        navigate("/dashboard");
        console.log("Login successful:", data);
        //navigate("/");
      }
    } catch (err) {
      setError("An error occured. Please try again.");
    }
  };

  return (
    //bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity
    <div
      className="min-h-screen bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 flex items-center
      justify-center relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r text-gray-200 bg-clip-text">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin}>
            <Input
              Icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              Icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p className="text-sm mb-2 text-red-500 mt-[-12px]">{error}</p> // Display error message in red
            )}
            <div className="flex items-center mb-6">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-200 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 font-bold
              rounded-lg shadow-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2
              focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to={"/signup"} className="text-gray-200 hover:underline">
              Signup
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
function setError(error: any) {
  throw new Error("Function not implemented.");
}
