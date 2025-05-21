// ./src/app/components/MachineDownDashboard/shared/DowntimeTable.jsx
import React from 'react';
import { Filter } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate } from '../utils/formatUtils';

export default function DowntimeTable({ logs, darkMode, onViewDetails, onResolve }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Filter className={`mx-auto h-12 w-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
        <h3 className="mt-2 text-lg font-medium">No results found</h3>
        <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Try changing your search criteria or clear filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Machine</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Issue</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Start Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">End Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Downtime</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-6 py-4 whitespace-nowrap">{log.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.machine_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.problem_description.length > 30 
                  ? `${log.problem_description.substring(0, 30)}...` 
                  : log.problem_description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={log.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden">
                <PriorityBadge priority={log.priority} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatDate(log.start_time)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.end_time ? formatDate(log.end_time) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {log.downtime_minutes ? (log.downtime_minutes / 60).toFixed(1) + ' hrs' : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(log.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      darkMode 
                        ? "bg-gray-700 hover:bg-gray-600" 
                        : "bg-gray-200 hover:bg-gray-300"
                    } flex items-center`}
                  >
                    <span>View</span>
                  </button>
                  
                  {(log.status === 'active' || log.status === 'in_progress') && (
                    <button
                      onClick={() => onResolve(log.id)}
                      className={`text-xs px-2 py-1 rounded ${
                        darkMode 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white flex items-center`}
                    >
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}