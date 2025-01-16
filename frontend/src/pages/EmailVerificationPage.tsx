import React, { useRef, useState, useEffect, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";

const EmailVerificationPage: React.FC = () => {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>(""); // To display error messages
  const [isLoading, setIsLoading] = useState<boolean>(false); // For loading state
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < pastedCode.length; i++) {
        if (i < newCode.length) {
          newCode[i] = pastedCode[i];
        }
      }
      setCode(newCode);

      const nextIndex =
        newCode.findIndex((digit) => digit === "") !== -1
          ? newCode.findIndex((digit) => digit === "")
          : newCode.length - 1;
      inputRefs.current[nextIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const verificationCode = code.join(""); // Combine all input values
    setError("");
    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId"); // Retrieve the userId stored during registration
      if (!userId) {
        setError("User ID not found. Please register again.");
        return;
      }

      const response = await api.post("/user/email/verify-token", {
        id: userId, // Use the stored `id`
        token: verificationCode,
      });

      if (response.data.success) {
        if (state?.fromForgotPassword) {
          navigate("/reset-password", { state: { userId } });
        } else {
          navigate("/login");
        }
      } else {
        setError(
          response.data.error || "Verification failed. Please try again."
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Automatically submit when all fields are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit") as any);
    }
  }, [code]);

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-red-400 to-purple-800 text-gray-200 flex items-center
      justify-center relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r text-gray-200 bg-clip-text">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-gray-200 focus:outline-none"
              />
            ))}
          </div>
          {error && (
            <p className="text-sm text-red-500 text-center mt-4">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-red-400 to-purple-800 text-gray-200
              font-bold rounded-lg shadow-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
              focus:ring-offset-gray-900 transition duration-200"
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
