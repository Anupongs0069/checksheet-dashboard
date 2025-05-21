// ./src/app/components/CheckQuality/CheckQualityInfoDisplay.jsx

import React from "react";
import {
  CpuIcon,
  HashIcon,
  WrenchIcon,
  BuildingIcon,
  BoxesIcon,
  Users,
  CodeIcon,
  Clipboard,
  Ruler,
} from "lucide-react";

const CheckQualityInfoDisplay = ({
  machineData,
  codeUnit,
  setCodeUnit,
  leadEmployeeId,
  setLeadEmployeeId,
  employeeId,
  setEmployeeId,
  isLoggedIn,
  user,
  darkMode,
  inputClass,
  readOnlyInputClass,
  workOrder,
  onWorkOrderChange,
  productName,
  onProductNameChange,
  dimensionCheck,
  onDimensionCheckChange,
  specOptions,
  codeUnitOptions,
}) => {
  const {
    machineName,
    machineNumber,
    machineModel,
    machineCustomer,
    machineProduct,
    machineSeriesnumber,
  } = machineData;

  return (
    <div className="mb-8">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
          <CpuIcon className="w-5 h-5" />
          Machine Information
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please verify the machine details below before proceeding with the
          quality inspection.
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
      </div>

      {/* Additional Fields Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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

        {/* Code Unit */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CodeIcon className="w-5 h-5 text-green-500" />
            <label className="font-medium">Code Unit</label>
          </div>
          <select
            className={`w-full px-3 py-2 rounded-md ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-100 border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            value={codeUnit}
            onChange={(e) => setCodeUnit(e.target.value)}
          >
            <option value="">-- Select Code Unit --</option>
            {codeUnitOptions &&
            Array.isArray(codeUnitOptions) &&
            codeUnitOptions.length > 0 ? (
              codeUnitOptions.map((option) => (
                <option
                  key={option.id || option.code_unit || option.value}
                  value={option.code_unit || option.value}
                >
                  {option.code_unit || option.value || option.name}
                </option>
              ))
            ) : (
              <option disabled>Loading code units...</option>
            )}
          </select>
        </div>

        {/* Specification Dropdown */}
        <div
          className={`p-4 rounded-lg border md:col-span-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-5 h-5 text-indigo-500" />
            <label className="font-medium">Specification</label>
          </div>

          <select
            className={`w-full px-3 py-2 rounded-md ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-100 border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            value={dimensionCheck}
            onChange={(e) => onDimensionCheckChange(e.target.value)}
            disabled={!codeUnit || codeUnit === ""}
          >
            <option value="">-- Select Specification --</option>
            {specOptions &&
            Array.isArray(specOptions) &&
            specOptions.length > 0 ? (
              specOptions.map((option) => (
                <option
                  key={
                    option.id || `${option.specLength}-${option.standardValue}`
                  }
                  value={option.specLength || option.standardValue}
                >
                  {option.item ? `${option.item} - ` : ""}
                  {option.specLength ||
                    `${option.standardValue} ${option.unit}`}
                </option>
              ))
            ) : (
              <option disabled>No specifications available</option>
            )}
          </select>

          {(!codeUnit || codeUnit === "") && (
            <p className="mt-1 text-sm text-yellow-500">
              Please select a Code Unit first
            </p>
          )}
        </div>

        {/* Employee ID Card - Only shown when not logged in */}
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
                  setEmployeeId(value);
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
        {isLoggedIn && user?.employee_id && (
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
              value={user.employee_id}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckQualityInfoDisplay;
