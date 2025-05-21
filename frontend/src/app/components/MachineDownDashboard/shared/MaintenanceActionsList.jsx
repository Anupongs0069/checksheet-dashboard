// ./src/app/components/MachineDownDashboard/shared/MaintenanceActionsList.jsx
import React from 'react';
import { Wrench } from 'lucide-react';
import { formatDate } from '../utils/formatUtils';

export default function MaintenanceActionsList({ actions, darkMode }) {
  if (!actions || actions.length === 0) {
    return (
      <div className={`p-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        <Wrench className="w-12 h-12 mx-auto mb-2 opacity-40" />
        <p>No maintenance actions recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <div 
          key={action.id || index}
          className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
        >
          <div className="flex items-start">
            <Wrench className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
              darkMode ? "text-blue-400" : "text-blue-500"
            }`} />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-medium">{action.action_description}</p>
                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formatDate(action.performed_at)}
                </span>
              </div>
              
              {action.spare_parts_used && (
                <div className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span className="font-medium">Parts used:</span> {action.spare_parts_used}
                </div>
              )}
              
              {action.notes && (
                <div className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {action.notes}
                </div>
              )}
              
              <div className={`mt-3 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <span>Performed by:</span> {action.performed_by}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}