// ./src/components/DarkModeProvider.jsx

'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import Navbar from './Navbar';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        {children}
      </div>
    </DarkModeContext.Provider>
  );
}