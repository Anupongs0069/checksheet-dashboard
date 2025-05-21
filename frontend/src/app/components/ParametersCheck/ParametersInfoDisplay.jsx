// src/app/components/ParametersCheck/ParametersInfoDisplay.jsx

import React, { useEffect } from "react";
import {
  CpuIcon,
  HashIcon,
  WrenchIcon,
  BuildingIcon,
  BoxesIcon,
  Users,
  Clipboard,
  Code,
} from "lucide-react";

const ParametersInfoDisplay = ({
  machineInfo,
  isLoggedIn,
  user,
  darkMode,
  employeeId,
  workOrder,
  productName,
  programName,
  programNameRequired,
  programNames,
  onEmployeeIdChange,
  onWorkOrderChange,
  onProductNameChange,
  onProgramNameChange,
  onLoadParameters,
  onResetProgramSelection,
}) => {
  const {
    machineName,
    machineNumber,
    machineModel,
    machineCustomer,
    machineProduct,
    machineSeriesnumber,
  } = machineInfo;

  // อัพเดต employeeId จาก user.employee_id เมื่อล็อกอินแล้ว
  useEffect(() => {
    if (isLoggedIn && user?.employee_id) {
      onEmployeeIdChange(user.employee_id);
    }
  }, [isLoggedIn, user, onEmployeeIdChange]);

  // console.log("ParametersInfoDisplay:", { isLoggedIn, user, employeeId });

  const readOnlyInputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  } focus:outline-none cursor-not-allowed`;

  const inputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  } focus:outline-none`;

  const buttonClass = `px-4 py-2 rounded-md text-white ${
    darkMode
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-blue-600 hover:bg-blue-700"
  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  // ฟังก์ชันตรวจสอบว่า Employee ID ถูกต้องหรือไม่
  const isEmployeeIdValid = isLoggedIn && user?.employee_id 
    ? true  // ถ้าล็อกอินแล้วและมี user.employee_id ถือว่าถูกต้อง
    : employeeId && employeeId.length === 6;  // ถ้าไม่ได้ล็อกอิน ตรวจว่ามีครบ 6 หลักหรือไม่

  return (
    <div className="mb-8">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
          <CpuIcon className="w-5 h-5" />
          Machine Information
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please verify the machine details below before proceeding with the
          parameter inspection.
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
            className={readOnlyInputClass}
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
            className={readOnlyInputClass}
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
            className={readOnlyInputClass}
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
            className={readOnlyInputClass}
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
            className={readOnlyInputClass}
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
            className={readOnlyInputClass}
            value={machineSeriesnumber}
            placeholder="Series number will appear after scan"
            readOnly
          />
        </div>

        {/* Work Order */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clipboard className="w-5 h-5 text-blue-500" />
            <label className="font-medium">Work Order</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={workOrder}
            onChange={(e) => onWorkOrderChange(e.target.value)}
            placeholder="Enter work order number"
          />
        </div>

        {/* Product Name */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <BoxesIcon className="w-5 h-5 text-green-500" />
            <label className="font-medium">Product Name</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            placeholder="Enter product name"
          />
        </div>

        {/* Employee ID Card */}
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
                  // Allow only numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  onEmployeeIdChange(value);
                }}
                onKeyPress={(e) => {
                  // Prevent non-digit characters
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                maxLength={6}
                placeholder="Please enter your employee ID."
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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

        {/* Employee ID Display (when logged in) */}
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
              className={readOnlyInputClass}
              value={user?.employee_id || employeeId}
              readOnly
            />
          </div>
        )}
      </div>

      {/* Program Name */}
      {!programNameRequired && (
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5 text-purple-500" />
            <label className="font-medium">Program Name</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={programName}
            onChange={(e) => onProgramNameChange(e.target.value)}
            placeholder="Enter program name"
          />
        </div>
      )}

      {/* Program Name Selection for specific machines */}
      {programNameRequired && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2H2v10h10V2z"></path>
              <path d="M12 12H2v10h10V12z"></path>
              <path d="M22 2h-10v20h10V2z"></path>
            </svg>
            <h4 className="font-medium">Select Program Name</h4>
          </div>
          <div className="mt-2">
            <select
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none`}
              value={programName}
              onChange={(e) => onProgramNameChange(e.target.value)}
            >
              <option value="">-- Please select a Program Name. --</option>
              {programNames.map((program, index) => (
                <option key={index} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Load Parameters Button */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium mb-1">Ready to Start Parameter Check</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click the button to load the parameter checklist
            </p>
          </div>
          <div className="flex gap-3">
            {programNameRequired && (
              <button
                onClick={() => {
                  onProgramNameChange("");
                  onResetProgramSelection();
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
              >
                Reset Selection
              </button>
            )}
            <button
              onClick={onLoadParameters}
              className={`${buttonClass} px-6`}
            >
              Load Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametersInfoDisplay;