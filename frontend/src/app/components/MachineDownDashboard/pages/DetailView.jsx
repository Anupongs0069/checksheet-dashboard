// ./src/app/components/MachineDownDashboard/pages/DetailView.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import Image from "next/image";
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  Wrench,
  User,
  CheckCircle2,
  XCircle,
  BarChart3,
  CalendarClock,
  FileText,
} from "lucide-react";

import { fetchDowntimeDetail as fetchDowntimeById } from "../utils/apiUtils";

import { formatDate } from "../utils/formatUtils";
import StatusBadge from "../shared/StatusBadge";
import PriorityBadge from "../shared/PriorityBadge";
import MaintenanceActionsList from "../shared/MaintenanceActionsList";

export default function DetailView({ id }) {
  const router = useRouter();
  const { user, getAuthHeader } = useAuth();
  const { darkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [downtimeData, setDowntimeData] = useState(null);

  useEffect(() => {
    const loadDowntimeDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await fetchDowntimeById(id, getAuthHeader());
        setDowntimeData(data);
      } catch (error) {
        console.error("Error loading downtime detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDowntimeDetail();
  }, [id, getAuthHeader]);

  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
  }`;

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className={`rounded-full p-2 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Downtime Details
            </h2>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {downtimeData &&
              (downtimeData.status === "active" ||
                downtimeData.status === "in_progress") && (
                <button
                  onClick={() =>
                    router.push(`/main-menu/machinedown-resolve/${id}`)
                  }
                  className={`rounded-lg px-4 py-2 ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white flex items-center space-x-2`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolve Issue</span>
                </button>
              )}

            <button
              onClick={() => router.push("/main-menu/machinedown-logs")}
              className={`rounded-lg px-4 py-2 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } flex items-center space-x-2`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>All Logs</span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Content */}
        {!isLoading && downtimeData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Issue Details */}
              <div className={cardClass}>
                <h3
                  className={`text-xl font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Issue Details
                </h3>
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  } mb-4`}
                >
                  <div className="flex items-start mb-4">
                    <AlertTriangle
                      className={`h-6 w-6 mr-2 flex-shrink-0 ${
                        darkMode ? "text-red-400" : "text-red-500"
                      }`}
                    />
                    <div>
                      <h4 className="font-medium text-lg mb-2">
                        {downtimeData.problem_description}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <StatusBadge status={downtimeData.status} />
                        <PriorityBadge priority={downtimeData.priority} />
                      </div>
                    </div>
                  </div>

                  {downtimeData.solution_description && (
                    <div className="mb-4 mt-6">
                      <h4
                        className={`text-sm font-medium mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Solution
                      </h4>
                      <p
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {downtimeData.solution_description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4
                      className={`text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Start Time
                    </h4>
                    <div className="flex items-center">
                      <Clock
                        className={`h-4 w-4 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>{formatDate(downtimeData.start_time)}</span>
                    </div>
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      End Time
                    </h4>
                    <div className="flex items-center">
                      <Clock
                        className={`h-4 w-4 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>{formatDate(downtimeData.end_time)}</span>
                    </div>
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Work Order
                    </h4>
                    <div className="flex items-center">
                      <FileText
                        className={`h-4 w-4 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>{downtimeData.work_order || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Shift
                    </h4>
                    <div className="flex items-center">
                      <CalendarClock
                        className={`h-4 w-4 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>{downtimeData.shift || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Total Downtime
                    </h4>
                    <div className="flex items-center">
                      <Clock
                        className={`h-4 w-4 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>
                        {downtimeData.downtime_minutes
                          ? `${(downtimeData.downtime_minutes / 60).toFixed(
                              1
                            )} hours`
                          : "Ongoing"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Reason
                    </h4>
                    <div className="flex items-center">
                      <AlertTriangle
                        className={`h-4 w-4 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>
                        {downtimeData.reason || downtimeData.category || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Actions */}
              <div className={cardClass}>
                <h3
                  className={`text-xl font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Maintenance Actions
                </h3>
                <MaintenanceActionsList
                  actions={downtimeData.maintenance_actions || []}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Machine Info */}
              <div className={cardClass}>
                <h3
                  className={`text-xl font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Machine Information
                </h3>
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <Wrench
                      className={`h-6 w-6 mr-2 ${
                        darkMode ? "text-blue-400" : "text-blue-500"
                      }`}
                    />
                    <h4 className="font-medium text-lg">
                      {downtimeData.machine_name}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Machine Number
                      </p>
                      <p>{downtimeData.machine_number || "-"}</p>
                    </div>
                    <div>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Model
                      </p>
                      <p>{downtimeData.model || "-"}</p>
                    </div>
                    <div>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Location
                      </p>
                      <p>{downtimeData.location || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignee Info */}
              <div className={cardClass}>
                <h3
                  className={`text-xl font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Personnel
                </h3>
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } mb-2`}
                    >
                      Reported By
                    </p>
                    <div className="flex items-center">
                      <User
                        className={`h-5 w-5 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>{downtimeData.reported_by || "-"}</span>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } mb-2`}
                    >
                      Assigned Technician
                    </p>
                    <div className="flex items-center">
                      <User
                        className={`h-5 w-5 mr-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span>
                        {downtimeData.technician_id || "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {(downtimeData.image_before_repair ||
                downtimeData.image_after_repair) && (
                <div className={cardClass}>
                  <h3
                    className={`text-xl font-bold mb-4 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Images
                  </h3>
                  <div className="space-y-4">
                    {downtimeData.image_before_repair && (
                      <div>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          } mb-2`}
                        >
                          Before Repair
                        </p>
                        <Image
                          src={`/api/images/${downtimeData.image_before_repair}`}
                          alt="Before repair"
                          width={500}
                          height={300}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    {downtimeData.image_after_repair && (
                      <div>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          } mb-2`}
                        >
                          After Repair
                        </p>
                        {/* รูปภาพหลังซ่อม */}
                        <Image
                          src={`/api/images/${downtimeData.image_after_repair}`}
                          alt="After repair"
                          width={500}
                          height={300}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Not Found */}
        {!isLoading && !downtimeData && (
          <div className={`${cardClass} p-12 text-center`}>
            <XCircle
              className={`h-16 w-16 mx-auto mb-4 ${
                darkMode ? "text-red-400" : "text-red-500"
              }`}
            />
            <h3 className="text-xl font-bold mb-2">Record Not Found</h3>
            <p
              className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              The downtime record you are looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <button
              onClick={() => router.push("/main-menu/machinedown-logs")}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Back to Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
