// src/app/main-menu/daily-machine-check/page.jsx

"use client";

import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useDarkMode } from "../../components/DarkModeProvider";
import { ClipboardCheck, CalendarCheck } from "lucide-react";
import { formatDate } from "../../components/DateFormatter";
import MachineDailyCheckForm from "../../components/DailyCheck/MachineDailyCheckForm";

function MachineDailyCheckPage() {
  const { isLoggedIn, user } = useAuth();
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <ClipboardCheck
              className={`w-8 h-8 ${darkMode ? "text-indigo-400" : "text-indigo-500"}`}
            />
            <h2
              className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Daily Machine Check
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <CalendarCheck className="w-6 h-6" />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        {/* Main Form Component */}
        <MachineDailyCheckForm isLoggedIn={isLoggedIn} user={user} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default MachineDailyCheckPage;