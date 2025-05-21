// ./src/app/components/MachineDownDashboard/pages/LogsList.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/app/components/DarkModeProvider";
import {
  AlertTriangle,
  Search,
  ChevronLeft,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { fetchDowntimeLogs } from "../utils/apiUtils";
import { formatDate } from "../utils/formatUtils";
import StatusBadge from "../shared/StatusBadge";
import PriorityBadge from "../shared/PriorityBadge";
import DowntimeTable from "../shared/DowntimeTable";

export default function LogsList() {
  const router = useRouter();
  const { user, getAuthHeader } = useAuth();
  const { darkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  
  // Filters
  const [filters, setFilters] = useState({
    status: "",
    machine_id: "",
    start_date: "",
    end_date: "",
    sort_by: "start_time",
    sort_dir: "DESC"
  });

  useEffect(() => {
    loadLogs();
  }, [pagination.page, filters]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const result = await fetchDowntimeLogs(
        {
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        },
        getAuthHeader()
      );
      
      setLogs(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading downtime logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to page 1 when filter changes
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      machine_id: "",
      start_date: "",
      end_date: "",
      sort_by: "start_time",
      sort_dir: "DESC"
    });
  };

  const cardClass = `p-6 rounded-lg shadow-md ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
  }`;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} p-8`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/main-menu/machinedown-dashdoard")}
              className={`rounded-full p-2 ${
                darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Machine Downtime Logs
            </h2>
          </div>
          
          <button
            onClick={() => router.push("/main-menu/machine-downtime")}
            className={`rounded-lg px-4 py-2 ${
              darkMode 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-blue-500 hover:bg-blue-600"
            } text-white flex items-center space-x-2`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report New Issue</span>
          </button>
        </div>

        {/* Filters */}
        <div className={cardClass}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
              Filters
            </h3>
            <button 
              onClick={clearFilters}
              className={`text-sm px-3 py-1 rounded ${
                darkMode 
                  ? "text-blue-400 hover:bg-gray-700" 
                  : "text-blue-600 hover:bg-gray-100"
              }`}
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className={`w-full p-2 border rounded-lg ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Results Table */}
        {!isLoading && (
          <div className={cardClass}>
            <DowntimeTable 
              logs={logs} 
              darkMode={darkMode} 
              onViewDetails={(id) => router.push(`/main-menu/machinedown-detail/${id}`)}
              onResolve={(id) => router.push(`/main-menu/machinedown-resolve/${id}`)}
            />
            
            {/* Pagination */}
            {logs.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4">
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Showing {logs.length} of {pagination.total} results
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setPagination(prev => ({...prev, page: Math.max(1, prev.page - 1)}))}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded ${
                      pagination.page === 1
                        ? (darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400")
                        : (darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-700")
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = pagination.page <= 3 
                      ? i + 1 
                      : pagination.page - 3 + i + (pagination.pages - pagination.page < 2 ? pagination.pages - pagination.page - 2 : 0);
                    
                    if (pageNum > pagination.pages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({...prev, page: pageNum}))}
                        className={`px-3 py-1 rounded ${
                          pagination.page === pageNum
                            ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                            : (darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-700")
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({...prev, page: Math.min(prev.pages, prev.page + 1)}))}
                    disabled={pagination.page === pagination.pages}
                    className={`px-3 py-1 rounded ${
                      pagination.page === pagination.pages
                        ? (darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400")
                        : (darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-700")
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}