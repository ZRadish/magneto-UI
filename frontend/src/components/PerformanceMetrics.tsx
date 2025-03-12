import React from "react";

interface CircularProgressProps {
  percentage: string | number;
  label: string;
  color?: "violet" | "red";
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  label,
  color = "violet",
}) => {
  // For "60%+" case, store as a clean number but add + to display
  const displayValue = String(percentage).includes("%+")
    ? `${parseInt(String(percentage))}%+`
    : percentage;

  const value = parseInt(String(percentage));

  // Calculate circle parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#374151"
            strokeWidth="8"
            fill="none"
          />

          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={`${color === "violet" ? "#8B5CF6" : "#F87171"}`}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />

          {/* Percentage text */}
          <text
            x="60"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold"
            fill={`${color === "violet" ? "#A78BFA" : "#F87171"}`}
          >
            {displayValue}
          </text>
        </svg>
      </div>
      <p className="mt-3 text-gray-400 text-center">{label}</p>
    </div>
  );
};

const PerformanceMetrics: React.FC = () => {
  return (
    <div className="mt-10 pt-8 border-t border-violet-900/50">
      <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-purple-800 bg-clip-text text-transparent mb-6">
        Performance Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CircularProgress percentage="73.3%" label="Bug Detection Rate" />

        <CircularProgress
          percentage="94.6%"
          label="Trigger Detection Accuracy"
        />
        <CircularProgress percentage="100%" label="Tool Integration" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CircularProgress percentage="74.8%" label="Oracle Coverage" />

        <CircularProgress percentage="60%+" label="Testing Time Reduction" />

        <CircularProgress percentage="98.3%" label="True Positive Rate" />
      </div>
    </div>
  );
};

export default PerformanceMetrics;
