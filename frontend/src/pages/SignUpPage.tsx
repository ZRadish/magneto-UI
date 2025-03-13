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

    // Validate empty fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
        setError("All fields are required.");
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }

    // Validate password strength
    if (!PasswordValid) {
        setError("Password must meet all strength requirements.");
        return;
    }

    try {
        // Step 1: Register the user
        const response = await api.post("/user/register", {
            firstName,
            lastName,
            email,
            password,
        });

        console.log("Register API Response:", response);

        const data = response.data;

        if (data.error) {
            if (data.error.includes("already exists")) {
                setError("A user with this email already exists. Please log in.");
            } else {
                setError(data.error);
            }
            return;
        }

        if (!data.user || !data.user.id) {
            setError("Unexpected error: Missing user ID in response.");
            return;
        }

        localStorage.setItem("userId", data.user.id);
        console.log("User Data:", data.user);

        // Step 2: Trigger email verification
        try {
            await api.post("/user/email/verify", {
                id: data.user.id,
                email: data.user.email,
            });
            navigate("/verify-email");
        } catch (verifyError) {
            console.error("Error sending verification email:", verifyError);
            setError("Registration successful, but email verification failed.");
        }
    } catch (error: any) {
        console.error("Error during signup:", error);
        if (error.response?.status === 409) {
            setError("A user with this email already exists. Please log in.");
        } else {
            setError(error.response?.data?.error || "An error occurred during registration.");
        }
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
              font-bold rounded-lg shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
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
