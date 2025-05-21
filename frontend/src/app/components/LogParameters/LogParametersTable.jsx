// .src/app/components/LogParameters/LogParametersTable.jsx

"use client";

import React from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import PrintReport from "./PrintReport/PrintReport";

// Utility function to format date to DD/MM/YYYY
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const shift = hours >= 6 && hours < 18 ? "D" : "N";

  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} [${shift}]`;
};

const LogParametersTable = ({ darkMode, filteredResults, isSearching }) => {
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
              Product
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Program
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Work Order
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Check
              <br />
              Date
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Checked
              <br />
              By
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
                <div className="break-words">{inspection.machine_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.machine_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center hidden">
                {inspection.model}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.customer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.product}
              </td>
              <td className="px-6 py-4 text-center tracking-wider">
                <div className="break-words">{inspection.program_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.work_order}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {formatDisplayDate(inspection.checked_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(inspection.status)}
                  <span
                    className={
                      inspection.status.toLowerCase() === "pass"
                        ? "text-green-500"
                        : inspection.status.toLowerCase() === "fail"
                          ? "text-red-500"
                          : inspection.status.toLowerCase() === "idle"
                            ? "text-yellow-500"
                            : "text-gray-500"
                    }
                  >
                    {inspection.status.toUpperCase()}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {inspection.checked_by}
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
            className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            No inspections found matching your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default LogParametersTable;