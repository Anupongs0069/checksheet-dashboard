// ./src/app/components/StatusMachineDashboard/ui/card.jsx

import React from 'react';
import { useDarkMode } from '@/app/components/DarkModeProvider';

const Card = ({ className, children }) => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'} rounded-lg shadow ${className || ''}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ className, children }) => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`px-6 py-4 ${darkMode ? 'border-gray-700' : 'border-b'} ${className || ''}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children }) => {
  const { darkMode } = useDarkMode();
  return (
    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : ''} ${className || ''}`}>
      {children}
    </h3>
  );
};

const CardContent = ({ className, children }) => {
  return (
    <div className={`px-6 py-4 ${className || ''}`}>
      {children}
    </div>
  );
};

const CardFooter = ({ className, children }) => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`px-6 py-4 ${darkMode ? 'border-gray-700' : 'border-t'} ${className || ''}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent, CardFooter };