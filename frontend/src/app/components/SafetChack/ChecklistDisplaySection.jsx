// src/app/components/DailyCheck/MachineInfoDisplay.jsx

import React from "react";
import { Loader2 } from "lucide-react";
import ChecklistGroup from "./ChecklistGroup";

/**
 * Component for displaying the entire checklist section
 */
const ChecklistDisplaySection = ({
  loading,
  showChecklist,
  checkData,
  darkMode,
  handleStatusChange,
  handleIssueDetailChange,
  handleSubmit,
  buttonClass
}) => {
  // If loading, show spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <div className="text-lg">Loading inspection items...</div>
      </div>
    );
  }

  // If not showing checklist or no items, don't render anything
  if (!showChecklist || checkData.checklist.length === 0) {
    return null;
  }

  // Group checklist items by group name
  const groupedItems = checkData.checklist.reduce((groups, item) => {
    const group = groups[item.groupName] || [];
    group.push(item);
    groups[item.groupName] = group;
    return groups;
  }, {});

  return (
    <>
      <div className="space-y-4 mt-6">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <ChecklistGroup
            key={groupName}
            groupName={groupName}
            items={items}
            darkMode={darkMode}
            handleStatusChange={handleStatusChange}
            handleIssueDetailChange={handleIssueDetailChange}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className={`${buttonClass} w-full mt-6`}
      >
        Save inspection results
      </button>
    </>
  );
};

export default ChecklistDisplaySection;