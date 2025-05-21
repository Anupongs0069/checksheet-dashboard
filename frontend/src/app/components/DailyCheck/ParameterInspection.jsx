import React from "react";

/**
 * Component for parameter-based inspection items
 * This is a placeholder component for future extension to support
 * parameter-based inspections with numeric values, ranges, etc.
 */
const ParameterInspection = ({ 
  item, 
  darkMode, 
  handleParameterChange 
}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-2">
        <span className="font-medium">{item.name}</span>
        <span className="block text-sm text-gray-500">
          {item.thaiName}
        </span>
      </div>
      
      <div className="flex items-center mt-2">
        <div className="w-1/3">
          <label className="text-sm font-medium">
            Value
          </label>
        </div>
        <div className="w-2/3">
          <input
            type="number"
            value={item.value || ""}
            onChange={(e) => handleParameterChange(item.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
      </div>
      
      {item.min !== undefined && item.max !== undefined && (
        <div className="mt-1 text-sm text-gray-500">
          Acceptable range: {item.min} - {item.max} {item.unit}
        </div>
      )}
      
      {item.value !== undefined && item.min !== undefined && item.max !== undefined && (
        <div className={`mt-2 text-sm ${
          item.value >= item.min && item.value <= item.max
            ? "text-green-500"
            : "text-red-500"
        }`}>
          {item.value >= item.min && item.value <= item.max
            ? "Value is within acceptable range"
            : "Value is outside acceptable range"}
        </div>
      )}
    </div>
  );
};

export default ParameterInspection;