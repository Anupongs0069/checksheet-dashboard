// src/app/components/MachineDownDashboard/pages/Dashboard.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  BarChart3,
  Wrench,
} from "lucide-react";
import { fetchDashboardData } from "../utils/apiUtils";
import { formatLongDateTime } from "../utils/formatUtils";

export default function Dashboard() {
  const router = useRouter();
  const { getAuthHeader } = useAuth();
  const { darkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [machineData, setMachineData] = useState({
    summary: {
      totalDowntime: 0,
      activeIssues: 0,
      activeOnlyIssues: 0,
      maintenanceIssues: 0,
      resolvedToday: 0,
      avgResolutionTime: 0,
    },
    issues: [],
  });

  const STATUS_LABELS = {
    down: "Down",
    maintenance: "Under Maintenance",
    waiting_leader_approval: "Waiting Approval",
    resolved: "Resolved",
    active: "Active",
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDashboardData("today", getAuthHeader());
        console.log("Dashboard API response:", data);
        setMachineData(data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [getAuthHeader]);

  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
  }`;

  const metricCardClass = `${cardClass} flex items-center justify-between`;

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <AlertTriangle
              className={`w-8 h-8 ${
                darkMode ? "text-red-400" : "text-red-500"
              }`}
            />
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Machine Down Dashboard
            </h2>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Total Downtime */}
              <div className={metricCardClass}>
                <div>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total Downtime
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {machineData.summary.totalDowntime} hrs
                  </p>
                </div>
                <Clock
                  className={`w-12 h-12 ${
                    darkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
              </div>

              {/* Active Issues */}
              <div className={metricCardClass}>
                <div>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Active Issues
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {machineData.summary.activeOnlyIssues || 0}
                  </p>
                </div>
                <AlertTriangle
                  className={`w-12 h-12 ${
                    darkMode ? "text-yellow-400" : "text-yellow-500"
                  }`}
                />
              </div>

              {/* Under Maintenance */}
              <div className={metricCardClass}>
                <div>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Under Maintenance
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {machineData.summary.maintenanceIssues || 0}
                  </p>
                </div>
                <Wrench
                  className={`w-12 h-12 ${
                    darkMode ? "text-blue-400" : "text-blue-500"
                  }`}
                />
              </div>

              {/* Resolved Today */}
              <div className={metricCardClass}>
                <div>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Resolved Today
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {machineData.summary.resolvedToday}
                  </p>
                </div>
                <CheckCircle2
                  className={`w-12 h-12 ${
                    darkMode ? "text-green-400" : "text-green-500"
                  }`}
                />
              </div>

              {/* Average Resolution Time */}
              <div className={metricCardClass}>
                <div>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Avg. Resolution Time
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {machineData.summary.avgResolutionTime} hrs
                  </p>
                </div>
                <Activity
                  className={`w-12 h-12 ${
                    darkMode ? "text-purple-400" : "text-purple-500"
                  }`}
                />
              </div>
            </div>

            {/* Machine Issues Table */}
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Machine Issues
                </h3>

                {machineData.issues.length > 0 && (
                  <button
                    onClick={() => router.push("/main-menu/machinedown-logs")}
                    className={`text-sm px-3 py-1 rounded ${
                      darkMode
                        ? "text-blue-400 hover:bg-gray-700"
                        : "text-blue-600 hover:bg-gray-100"
                    }`}
                  >
                    View All Issues
                  </button>
                )}
              </div>

              {machineData.issues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2
                    className={`mx-auto h-12 w-12 ${
                      darkMode ? "text-green-400" : "text-green-500"
                    }`}
                  />
                  <h3 className="mt-2 text-lg font-medium">No active issues</h3>
                  <p
                    className={`mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    All machines are currently operational
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          Machine Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          Machine Number
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          Problem Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {machineData.issues.map((issue) => (
                        <tr key={issue.machine_downtime_id || issue.id}>
                          <td className="text-center px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BarChart3 className="text-center w-5 h-5 mr-2" />
                              {issue.machine_name ||
                                issue.machineName ||
                                issue.machinename}
                            </div>
                          </td>
                          <td className="text-center px-6 py-4 whitespace-nowrap">
                            {issue.machine_number || "N/A"}
                          </td>
                          <td className="text-center px-6 py-4 whitespace-nowrap">
                            {issue.problem_type || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {issue.starttime
                                ? formatLongDateTime(issue.starttime)
                                : issue.startTime
                                ? formatLongDateTime(issue.startTime)
                                : issue.start_time
                                ? formatLongDateTime(issue.start_time)
                                : "N/A"}
                            </div>
                          </td>
                          <td className="text-center px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                issue.status === "active"
                                  ? darkMode
                                    ? "bg-red-900 text-red-200"
                                    : "bg-red-100 text-red-800"
                                  : issue.status === "maintenance"
                                  ? darkMode
                                    ? "bg-blue-900 text-blue-200"
                                    : "bg-blue-100 text-blue-800"
                                  : darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {STATUS_LABELS[issue.status] || issue.status}
                            </span>
                          </td>
                          <td className="text-center px-6 py-4 whitespace-nowrap text-sm">
                            {issue.status === "active" ? (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/main-menu/machinedown-dashdoard/machinedown-assign/${
                                      issue.machine_downtime_id || issue.id
                                    }`
                                  )
                                }
                                className={`text-sm px-3 py-1 rounded ${
                                  darkMode
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-blue-500 hover:bg-blue-600"
                                } text-white`}
                              >
                                Accept Job
                              </button>
                            ) : issue.status === "maintenance" ? (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/main-menu/machinedown-dashdoard/machinedown-resolve/${
                                      issue.machine_downtime_id || issue.id
                                    }`
                                  )
                                }
                                className={`text-sm px-3 py-1 rounded ${
                                  darkMode
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-green-500 hover:bg-green-600"
                                } text-white`}
                              >
                                Complete Repair
                              </button>
                            ) : (
                              <span
                                className={`text-sm px-3 py-1 ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {STATUS_LABELS[issue.status] || issue.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
