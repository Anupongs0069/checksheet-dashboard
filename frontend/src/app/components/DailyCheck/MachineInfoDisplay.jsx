// ./src/app/components/DailyCheck/MachineInfoDisplay.jsx

import React from "react";
import {
  CpuIcon,
  HashIcon,
  WrenchIcon,
  BuildingIcon,
  BoxesIcon,
  Users,
} from "lucide-react";

/**
 * Component to display machine information
 */
const MachineInfoDisplay = ({
  darkMode,
  machineName,
  machineNumber,
  machineModel,
  machineCustomer,
  machineProduct,
  machineSeriesnumber,
  employeeId,
  isLoggedIn,
  user,
  setEmployeeId,
}) => {
  const inputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  } focus:outline-none cursor-not-allowed`;

  const activeInputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <div className="mb-8">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
          <CpuIcon className="w-5 h-5" />
          Machine Information
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please verify the machine details below before proceeding with the
          inspection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Machine Name Card */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CpuIcon className="w-5 h-5 text-blue-500" />
            <label className="font-medium">Machine Name</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={machineName}
            placeholder="Machine name will appear after scan"
            readOnly
          />
        </div>

        {/* Machine No Card */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <HashIcon className="w-5 h-5 text-green-500" />
            <label className="font-medium">Machine Number</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={machineNumber}
            placeholder="Machine number will appear after scan"
            readOnly
          />
        </div>

        {/* Model Card */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <WrenchIcon className="w-5 h-5 text-purple-500" />
            <label className="font-medium">Model</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={machineModel}
            placeholder="Model will appear after scan"
            readOnly
          />
        </div>

        {/* Customer Card */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <BuildingIcon className="w-5 h-5 text-orange-500" />
            <label className="font-medium">Customer</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={machineCustomer}
            placeholder="Customer will appear after scan"
            readOnly
          />
        </div>

        {/* Product Card */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <BoxesIcon className="w-5 h-5 text-red-500" />
            <label className="font-medium">Product</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={machineProduct}
            placeholder="Product will appear after scan"
            readOnly
          />
        </div>

        {/* Series Number Card */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <HashIcon className="w-5 h-5 text-indigo-500" />
            <label className="font-medium">Series Number</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={machineSeriesnumber}
            placeholder="Series number will appear after scan"
            readOnly
          />
        </div>

        {/* Employee ID Card for non-logged in users */}
        {!isLoggedIn && (
          <div
            className={`p-4 rounded-lg border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <label className="font-medium">Employee ID</label>
            </div>
            <div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => {
                  // Only allow numbers and maximum 6 digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setEmployeeId(value);
                }}
                onKeyPress={(e) => {
                  // Prevent non-numeric characters
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                maxLength={6}
                placeholder="Please enter your employee ID."
                className={activeInputClass}
              />
              {employeeId.length > 0 && employeeId.length < 6 && (
                <p className="mt-1 text-sm text-yellow-500">
                  Please enter a 6-digit employee ID.
                </p>
              )}
              {employeeId.length === 6 && (
                <p className="mt-1 text-sm text-green-500">
                  Employee ID is complete with 6 digits.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Employee ID Display for logged in users */}
        {isLoggedIn && (
          <div
            className={`p-4 rounded-lg border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <label className="font-medium">Employee ID</label>
            </div>
            <input
              type="text"
              className={inputClass}
              value={user?.employee_id || employeeId}
              readOnly
            />
          </div>
        )}
        
      </div>
      
    </div>
  );
};

export default MachineInfoDisplay;
