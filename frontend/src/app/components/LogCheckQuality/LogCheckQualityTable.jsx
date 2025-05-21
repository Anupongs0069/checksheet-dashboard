// ./src/app/components/LogCheckQuality/LogCheckQualityTable.jsx

"use client";

import React from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import PrintReport from "./PrintReport/PrintReport";

// Utility function to format date to DD/MM/YYYY
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const shift = date.getHours() >= 6 && date.getHours() < 18 ? "D" : "N";

  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} [${shift}]`;
};

const LogCheckQualityTable = ({ darkMode, filteredResults, isSearching, machines, models }) => {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pass":
        return <CheckCircle className="text-green-500" />;
      case "fail":
        return <XCircle className="text-red-500" />;
      case "idle":
        return <AlertCircle className="text-yellow-500" />;
      default:
        return <AlertCircle className="text-gray-500" />;
    }
  };

  // Helper function to get machine name
  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.machine_name : `Machine ${machineId}`;
  };

  // Helper function to get machine number
  const getMachineNumber = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.machine_number : `-`;
  };

  // Helper function to get customer
  const getCustomer = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.customer : `-`;
  };

  // Helper function to get model name
  const getModelName = (modelId) => {
    const model = models.find(m => m.id === modelId);
    return model ? (model.model_name || model.machine_name || model.model || `Model ${modelId}`) : `Model ${modelId}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Machine
              <br />
              Name
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Machine
              <br />
              Number
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider hidden">
              Model
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Work
              <br />
              Order
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Barcode
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Inspection
              <br />
              Date
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Result
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Employee
              <br />
              ID
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Report
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredResults.map((inspection) => (
            <tr
              key={inspection.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-6 py-4 text-center">
                <div className="break-words">{getMachineName(inspection.machine_id)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {getMachineNumber(inspection.machine_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center hidden">
                {getModelName(inspection.machine_model_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {getCustomer(inspection.machine_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.work_order}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.barcode_unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {formatDisplayDate(inspection.inspection_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(inspection.overall_result)}
                  <span
                    className={
                      inspection.overall_result.toLowerCase() === "pass"
                        ? "text-green-500"
                        : inspection.overall_result.toLowerCase() === "fail"
                          ? "text-red-500"
                          : inspection.overall_result.toLowerCase() === "idle"
                            ? "text-yellow-500"
                            : "text-gray-500"
                    }
                  >
                    {inspection.overall_result.toUpperCase()}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.employee_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <PrintReport inspection={inspection} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* No Results Message */}
      {isSearching && filteredResults.length === 0 && (
        <div className="text-center py-4">
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No inspections found matching your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default LogCheckQualityTable;