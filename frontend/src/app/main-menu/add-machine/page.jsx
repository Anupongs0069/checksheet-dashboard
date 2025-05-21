// src/app/main-menu/add-machine/page.jsx

"use client";

import MachineForm from '@/app/components/machine/MachineForm';
import { useDarkMode } from '@/app/components/DarkModeProvider';

export default function AddMachinePage() {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <MachineForm darkMode={darkMode} />
      </div>
    </div>
  );
}