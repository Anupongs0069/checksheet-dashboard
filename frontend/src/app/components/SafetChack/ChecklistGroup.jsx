// src/app/components/DailyCheck/MachineInfoDisplay.jsx

import React from "react";
import ChecklistItem from "./ChecklistItem";

/**
 * Component to display a group of checklist items
 */
const ChecklistGroup = ({ 
  groupName, 
  items, 
  darkMode, 
  handleStatusChange, 
  handleIssueDetailChange 
}) => {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="text-lg font-medium mb-4">
        {groupName}
        <span className="block text-sm text-gray-500">
          {items[0]?.groupThaiName || ""}
        </span>
      </h4>
      <div className="space-y-4">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            darkMode={darkMode}
            handleStatusChange={handleStatusChange}
            handleIssueDetailChange={handleIssueDetailChange}
          />
        ))}
      </div>
    </div>
  );
};

export default ChecklistGroup;