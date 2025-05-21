// ./src/app/components/DownTime/DownTimeList.jsx
import React from "react";
import { AlertTriangle, Wrench, FileText } from "lucide-react";

const DownTimeList = ({
  darkMode,
  problemTypes,
  reasonList,
  problemType,
  selectedReason,
  workOrder,
  problemDetail,
  setProblemType,
  setSelectedReason,
  setWorkOrder,
  setProblemDetail
}) => {
  const selectClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const inputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const textareaClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <div className="mb-8">
      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Problem Details
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please provide details about the issue you're experiencing with the
          machine.
        </p>
      </div>

      {/* Problem Type and Work Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Problem Type */}
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            <label className="font-medium">
              Problem Type <span className="text-red-500">*</span>
            </label>
          </div>
          <select
            className={selectClass}
            value={problemType}
            onChange={(e) => {
              setProblemType(e.target.value);
            }}
            required
          >
            <option value="">Select Problem Type</option>
            {problemTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.value} ({type.label})
              </option>
            ))}
          </select>
          {problemType === "" && (
            <p className="mt-1 text-sm text-yellow-500">
              Please select problem type
            </p>
          )}
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
            <FileText className="w-5 h-5 text-green-500" />
            <label className="font-medium">Work Order</label>
          </div>
          <input
            type="text"
            className={inputClass}
            value={workOrder}
            onChange={(e) => setWorkOrder(e.target.value)}
            placeholder="Enter work order number (if applicable)"
          />
        </div>
      </div>

      {/* Problem Reason - ซ่อนทั้งส่วน */}
      <div className="hidden">
        <div
          className={`p-4 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <label className="font-medium">Reason</label>
          </div>
          <select
            className={selectClass}
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">Select Reason</option>
            {reasonList.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.category}: {reason.reason}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem Description */}
      <div
        className={`p-4 rounded-lg border ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-5 h-5 text-yellow-500" />
          <label className="font-medium">
            Problem Description <span className="text-red-500">*</span>
          </label>
        </div>
        <textarea
          className={textareaClass}
          value={problemDetail}
          onChange={(e) => setProblemDetail(e.target.value)}
          rows="4"
          placeholder="Enter detailed description of the problem..."
          required
        />
      </div>
    </div>
  );
};

export default DownTimeList;