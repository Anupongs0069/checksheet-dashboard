// src/app/components/StatusMachineDashboard/ui-components/MachineTable.jsx

import React from "react";
import StatusIndicator from "./StatusIndicator";
import { formatDateTime } from "../utils/helpers";
import { useDarkMode } from "@/app/components/DarkModeProvider";

const MachineTable = ({ machines, onViewDetails }) => {
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 text-white" : "bg-white"
      } rounded-lg shadow-sm overflow-hidden`}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <tr>
            <th
              className={`px-6 py-3 text-left text-xs font-medium ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } uppercase tracking-wider`}
            >
              ชื่อเครื่อง
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } uppercase tracking-wider`}
            >
              รหัสเครื่อง
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } uppercase tracking-wider`}
            >
              สถานะ
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } uppercase tracking-wider`}
            >
              แผนก
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } uppercase tracking-wider`}
            >
              การหยุดทำงานล่าสุด
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium ${
                darkMode ? "text-gray-300" : "text-gray-500"
              } uppercase tracking-wider`}
            >
              การดำเนินการ
            </th>
          </tr>
        </thead>
        <tbody
          className={`${darkMode ? "bg-gray-800" : "bg-white"} divide-y ${
            darkMode ? "divide-gray-700" : "divide-gray-200"
          }`}
        >
          {machines.map((machine) => (
            <tr
              key={machine.id}
              className={`${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className={`text-sm font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {machine.machine_name}
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {machine.model || "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className={`text-sm ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {machine.machine_number || "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusIndicator status={machine.status} />
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {machine.department || "-"}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {machine.last_downtime
                  ? formatDateTime(machine.last_downtime)
                  : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  className={`${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-900"
                  } mr-4`}
                  onClick={() => onViewDetails(machine.id)}
                >
                  ดูรายละเอียด
                </button>
                {machine.status === "down" && (
                  <button
                    className={`${
                      darkMode
                        ? "text-red-400 hover:text-red-300"
                        : "text-red-600 hover:text-red-900"
                    } mr-4`}
                  >
                    แจ้งซ่อม
                  </button>
                )}
                <button
                  className={`${
                    darkMode
                      ? "text-green-400 hover:text-green-300"
                      : "text-green-600 hover:text-green-900"
                  }`}
                >
                  แก้ไข
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MachineTable;
