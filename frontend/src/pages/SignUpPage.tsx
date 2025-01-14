import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrength";
import api from "../utils/api.ts";

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [PasswordValid, setPasswordValid] = useState(false);
  const navigate = useNavigate();
  const validatePassword = (password: string) => {
    const isStrongPassword =
      password.length >= 6 && //At least 6 characters
      /[A-Z]/.test(password) && //Contains uppercase letter
      /[a-z]/.test(password) && //Contains lowercase letter
      /\d/.test(password) && //Contains a number
      /[^A-Za-z0-9]/.test(password); //Contains special character

    setPasswordValid(isStrongPassword); //Update state based on password strength
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    console.log("Name:", firstName);

    if (!firstName || !lastName || !email || !password) {
      setError("Must populate all fields");
      return;
    }

    //If password is not valid, prevent form submission
    if (!PasswordValid) {
      setError("Password must meet all strength requirements.");
      return;
    }

    const response = await api.post("/user/register", {
      firstName,
      lastName,
      email,
      password,
      isVerified: false, // Set default value
    });

    const data = response.data;
    console.log("API Response Data:", data);

    if (data.error) {
      setError(data.error);
    } else {
      // Handle successful registration (e.g., redirect to login or show success message)
      console.log("Registration successful:", data);
     // localStorage.setItem("UserId", data.user.id);
      //   console.log("userid::", data.UserId);
      //localStorage.setItem("UserId", data.UserId);
      // navigate("/verify-email", { state: { UserId: data.UserId } }); //Navigate to email verification page
      navigate("/verify-email");
    }
  };

  useEffect(() => {
    validatePassword(password); //Initial validation
  }, [password]);

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 flex items-center
      justify-center relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r text-gray-200 bg-clip-text">
            Create Account
          </h2>
          <form onSubmit={handleSignUp}>
            <Input
              Icon={User}
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              Icon={User}
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
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
            <PasswordStrengthMeter password={password} />
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p> // Ensure error is styled with red text
            )}
            <motion.button
              type="submit"
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200
              font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
              focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to={"/login"} className="text-gray-200 hover:underline">
              {" "}
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
