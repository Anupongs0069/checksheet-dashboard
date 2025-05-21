// ./src/app/components/StatusMachineDashboard/StatusDashboardForm.jsx

"use client";

import React from "react";
import {
  Search,
  Filter,
  RefreshCw,
  LayoutGrid,
  List,
  Calendar,
  XCircle,
} from "lucide-react";
import { STATUS } from "./utils/helpers";
import { useDarkMode } from "@/app/components/DarkModeProvider";

const StatusDashboardForm = ({
  searchTerm,
  setSearchTerm,
  departments,
  selectedDepartment,
  setSelectedDepartment,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  currentView,
  setCurrentView,
  timeRange,
  setTimeRange,
  refreshData,
}) => {
  // ใช้ useDarkMode hook แทนการรับ darkMode เป็น prop
  const { darkMode } = useDarkMode();

  const inputClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const selectClass = `w-full px-3 py-2 border rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-100 border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const buttonClass = `px-3 py-2 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
  } border transition-colors`;

  const activeButtonClass = `px-3 py-2 rounded-md text-sm font-medium ${
    darkMode
      ? "bg-blue-600 text-white border-blue-700"
      : "bg-blue-500 text-white border-blue-500"
  } border transition-colors`;

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setSelectedDepartment("all");
    setSortBy("machine_name");
  };

  return (
    <div
      className={`mb-6 p-4 rounded-lg shadow ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search input */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } h-4 w-4`}
          />
          <input
            type="text"
            placeholder="Search by machinery name or code"
            className={`${inputClass} pl-10`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Department filter */}
        <div className="relative">
          <Filter
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } h-4 w-4`}
          />
          <select
            className={`${selectClass} pl-10`}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } h-4 w-4`}
          />
          <select
            className={`${selectClass} pl-10`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value={STATUS.RUNNING}>Operating Normally</option>
            <option value={STATUS.IDLE}>Idel</option>
            <option value={STATUS.MAINTENANCE}>Under Maintenance</option>
            <option value={STATUS.DOWN}>Machine Breakdown</option>
            <option value="waiting_leader_approval">
              Waiting Leader Approve
            </option>
            <option value="waiting_for_customer">Awaiting Customer Response</option>
          </select>
        </div>

        {/* Sort by */}
        <div className="relative">
          <Filter
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } h-4 w-4`}
          />
          <select
            className={`${selectClass} pl-10`}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="machine_name">Sort by name</option>
            <option value="status">Sorted by status</option>
            <option value="uptime">Sorted by operating tim</option>
            <option value="department">Sorted by department</option>
          </select>
        </div>
      </div>

      {/* Time range and action buttons */}
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              } h-4 w-4`}
            />
            <select
              className={`${selectClass} pl-10`}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">This quarter</option>
              <option value="year">This year</option>
            </select>
          </div>

          <div className="flex border rounded-md overflow-hidden">
            <button
              className={
                currentView === "grid" ? activeButtonClass : buttonClass
              }
              onClick={() => setCurrentView("grid")}
              title="แสดงแบบกริด"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              className={
                currentView === "list" ? activeButtonClass : buttonClass
              }
              onClick={() => setCurrentView("list")}
              title="แสดงแบบตาราง"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-md ${
              darkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600"
                : "bg-white text-gray-600 hover:bg-gray-50 border-gray-300"
            } transition-colors flex items-center gap-2 text-sm font-medium border`}
          >
            <XCircle className="w-4 h-4" />
            Clear Filters
          </button>

          <button
            onClick={refreshData}
            className={`px-4 py-2 rounded-md ${
              darkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transition-colors flex items-center gap-2 text-sm font-medium`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboardForm;
