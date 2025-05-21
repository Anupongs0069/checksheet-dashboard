// src/app/components/LogSafetyCheck/LogSafetyCheckStats.jsx

"use client";
import React from "react";

const LogSafetyCheckStats = ({ darkMode, filteredResults }) => {
  const getStats = () => {
    const stats = {
      total: filteredResults.length,
      pass: filteredResults.filter((m) => m.status.toLowerCase() === "pass")
        .length,
      fail: filteredResults.filter((m) => m.status.toLowerCase() === "fail")
        .length,
      idle: filteredResults.filter((m) => m.status.toLowerCase() === "idle")
        .length,
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-gray-700" : "bg-gray-50"
        }`}
      >
        <p className="text-sm font-medium mb-1">Total Inspections</p>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-gray-700" : "bg-gray-50"
        }`}
      >
        <p className="text-sm font-medium mb-1">Pass</p>
        <p className="text-2xl font-bold text-green-500">{stats.pass}</p>
      </div>
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-gray-700" : "bg-gray-50"
        }`}
      >
        <p className="text-sm font-medium mb-1">Fail</p>
        <p className="text-2xl font-bold text-red-500">{stats.fail}</p>
      </div>
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-gray-700" : "bg-gray-50"
        }`}
      >
        <p className="text-sm font-medium mb-1">Idle</p>
        <p className="text-2xl font-bold text-yellow-500">{stats.idle}</p>
      </div>
    </div>
  );
};

export default LogSafetyCheckStats;