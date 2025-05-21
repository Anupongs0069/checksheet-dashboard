// src/app/components/DailyCheck/MachineInfoDisplay.jsx

import React from "react";

/**
 * Component for machine inspection action buttons (Load Checklist and Machine Idle)
 */
const ActionButtons = ({ darkMode, handleLoadChecklist, handleMachineIdle }) => {
  const buttonClass = `px-4 py-2 rounded-md text-white ${darkMode
    ? "bg-indigo-600 hover:bg-indigo-700"
    : "bg-blue-600 hover:bg-blue-700"
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium mb-1">
            Ready to Start Inspection
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click the button to load the inspection checklist or mark
            machine as idle
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleMachineIdle}
            className={`px-4 py-2 rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 ease-in-out`}
          >
            Machine Idle
          </button>
          <button
            onClick={handleLoadChecklist}
            className={`${buttonClass} px-6`}
          >
            Load Inspection Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;