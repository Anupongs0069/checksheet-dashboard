// src/app/components/DailyCheck/MachineInfoDisplay.jsx

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

/**
 * Individual checklist item component
 */
const ChecklistItem = ({ 
  item, 
  darkMode, 
  handleStatusChange, 
  handleIssueDetailChange 
}) => {
  return (
    <div key={item.id} className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-medium">{item.item}</span>
          <span className="block text-sm text-gray-500">
            {item.thaiItem}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange(item.id, "pass")}
            className={`p-2 rounded-md ${
              item.status === "pass"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
            aria-label="Pass"
            title="Pass"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStatusChange(item.id, "fail")}
            className={`p-2 rounded-md ${
              item.status === "fail"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
            aria-label="Fail"
            title="Fail"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      {item.status === "fail" && (
        <textarea
          value={item.issueDetail}
          onChange={(e) => handleIssueDetailChange(item.id, e.target.value)}
          placeholder="Please provide the details of the issue..."
          className={`w-full px-3 py-2 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2`}
          rows="2"
        />
      )}
    </div>
  );
};

export default ChecklistItem;