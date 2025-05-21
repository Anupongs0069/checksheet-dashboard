// ./src/app/main-menu/page.jsx

"use client";

import React, { useState, useEffect } from "react";
import LevelUser from "../components/LevelUser";
import { useDarkMode } from "../components/DarkModeProvider";
import { useAuth } from "../../contexts/AuthContext";

const MainMenuPage = () => {
  const [userRole, setUserRole] = useState(0); 
  const { darkMode } = useDarkMode();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    setUserRole(user ? user.role : 0);
  }, [user]);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } transition-colors duration-300`}
    >
      <LevelUser userRole={userRole} />
    </div>
  );
};

export default MainMenuPage;
