// src/app/components/StatusMachineDashboard/components/ui-components/SearchFilterBar.jsx

import React, { useState } from "react";
import { Search, Filter, RefreshCw, SlidersHorizontal } from "lucide-react";
import { STATUS_LABELS } from "../utils/helpers";
import { useDarkMode } from "@/app/components/DarkModeProvider";

const SearchFilterBar = ({
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
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800 text-white" : "bg-white"
      } rounded-lg shadow-md p-4 mb-6`}
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full md:w-64">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-400"
              } h-4 w-4`}
            />
            <input
              type="text"
              placeholder="ค้นหาเครื่องจักร..."
              className={`pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
            className={`flex items-center gap-1 px-3 py-2 border rounded-md ${
              darkMode
                ? "border-gray-600 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>ตัวกรอง</span>
          </button>

          <select
            className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">ทุกสถานะ</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="today">วันนี้</option>
            <option value="week">7 วันล่าสุด</option>
            <option value="month">30 วันล่าสุด</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300"
            }`}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="machine_name">เรียงตามชื่อ</option>
            <option value="status">เรียงตามสถานะ</option>
            <option value="department">เรียงตามแผนก</option>
            <option value="last_downtime">เรียงตามเวลาหยุดทำงานล่าสุด</option>
          </select>

          <div
            className={`flex border rounded-md overflow-hidden ${
              darkMode ? "border-gray-600" : "border-gray-300"
            }`}
          >
            <button
              className={`px-3 py-2 ${
                currentView === "grid"
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-white"
              }`}
              onClick={() => setCurrentView("grid")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`px-3 py-2 ${
                currentView === "list"
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-white"
              }`}
              onClick={() => setCurrentView("list")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <button
            className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={refreshData}
          >
            <RefreshCw className="h-4 w-4" />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {isAdvancedFilterOpen && (
        <div
          className={`mt-4 p-4 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>ตัวกรองขั้นสูง</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                แผนก
              </label>
              <select
                className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">ทุกแผนก</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
