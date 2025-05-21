// ./src/app/components/LogParameters/LogParametersStats.jsx ที่แก้ไขแล้ว
"use client";

import React from "react";

const LogParametersStats = ({ darkMode, filteredResults }) => {
  const getStats = () => {
    const stats = {
      total: filteredResults.length,
      pass: filteredResults.filter((inspection) => inspection.status.toLowerCase() === "pass").length,
      fail: filteredResults.filter((inspection) => inspection.status.toLowerCase() === "fail").length,
      idle: filteredResults.filter((inspection) => inspection.status.toLowerCase() === "idle").length,
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
        <p className="text-sm font-medium mb-1">Total</p>
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
        <p className="text-sm font-medium mb-1">Not working</p>
        <p className="text-2xl font-bold text-yellow-500">{stats.idle}</p>
      </div>
    </div>
  );
};

export default LogParametersStats;