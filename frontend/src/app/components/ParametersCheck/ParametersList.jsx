// src/app/components/ParametersCheck/ParametersList.jsx

import React from "react";
import { Loader2, FileDigit, CheckCircle2, XCircle } from "lucide-react";

const ParametersList = ({
  loading,
  showParameters,
  parameterData,
  darkMode,
  onMeasuredValueChange,
  onIssueDetailChange,
  onSubmit
}) => {
  const buttonClass = `px-4 py-2 rounded-md text-white ${darkMode
    ? "bg-indigo-600 hover:bg-indigo-700"
    : "bg-blue-600 hover:bg-blue-700"
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <div className="text-lg">Loading parameter items...</div>
      </div>
    );
  }

  if (!showParameters || parameterData.parameters.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
        <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
          <FileDigit className="w-5 h-5" />
          Parameter Checks
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Measure each parameter and enter the value. The system will automatically check if it's within tolerance.
        </p>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Parameter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Standard Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Tolerance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Measured Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            {parameterData.parameters.map((parameter) => (
              <tr key={parameter.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{parameter.item}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{parameter.thaiItem}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {parameter.standardValue} {parameter.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ±{parameter.tolerance} {parameter.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md ${darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    value={parameter.measuredValue}
                    onChange={(e) => onMeasuredValueChange(parameter.id, e.target.value)}
                    placeholder="Enter value"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2 items-center">
                    <div className="flex items-center">
                      {parameter.status === "pass" && (
                        <span className="text-green-500 dark:text-green-400 flex items-center">
                          <CheckCircle2 className="w-5 h-5 mr-2" /> Pass
                        </span>
                      )}
                      {parameter.status === "fail" && (
                        <span className="text-red-500 dark:text-red-400 flex items-center">
                          <XCircle className="w-5 h-5 mr-2" /> Fail
                        </span>
                      )}
                      {parameter.status === null && (
                        <span className="text-gray-500 dark:text-gray-400">
                          Waiting for measurement
                        </span>
                      )}
                    </div>

                    {parameter.status === null && parameter.measuredValue && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Waiting for verification</span>
                    )}
                    {parameter.status === "fail" && (
                      <div className="mt-2">
                        <textarea
                          value={parameter.issueDetail}
                          onChange={(e) => onIssueDetailChange(parameter.id, e.target.value)}
                          placeholder="Please describe the issue (required when fail)..."
                          className={`w-full px-3 py-2 border rounded-md ${darkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          rows="2"
                          required
                        />
                        {!parameter.issueDetail?.trim() && parameter.status === "fail" && (
                          <p className="text-red-500 text-sm mt-1">
                            Description is required for failed parameters
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onSubmit}
        className={`${buttonClass} w-full mt-6`}
      >
        Save Parameter Check Results
      </button>
    </>
  );
};

export default ParametersList;