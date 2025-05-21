// src/app/components/StatusMachineDashboard/ui/tabs.jsx

import React, { useState, createContext, useContext, useEffect } from 'react';
import { useDarkMode } from '@/app/components/DarkModeProvider';

// สร้าง Context สำหรับ Tabs
const TabsContext = createContext(null);

const Tabs = ({ defaultValue, className, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children }) => {
  const { darkMode } = useDarkMode();
  return (
    <div className={`flex ${darkMode ? 'border-gray-700' : 'border-b'} ${className || ''}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, className, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const { darkMode } = useDarkMode();
  const isActive = activeTab === value;
  
  return (
    <button
      type="button"
      className={`px-4 py-2 font-medium ${
        isActive
          ? `border-b-2 ${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-500 text-blue-600'}`
          : `${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'}`
      } ${className || ''}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children }) => {
  const { activeTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  
  if (!isActive) return null;
  
  return (
    <div className={`mt-4 ${className || ''}`}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };