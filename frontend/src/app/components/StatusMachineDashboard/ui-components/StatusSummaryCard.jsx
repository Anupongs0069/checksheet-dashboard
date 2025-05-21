// src/app/components/StatusMachineDashboard/components/ui-components/StatusSummaryCard.jsx
import React from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { STATUS, STATUS_COLORS, STATUS_LABELS } from "../utils/helpers";
import { useDarkMode } from "@/app/components/DarkModeProvider";

// ไอคอนที่แสดงตามสถานะ
const STATUS_ICONS = {
  [STATUS.RUNNING]: <Activity className="h-5 w-5 text-green-500" />,
  [STATUS.IDLE]: <Clock className="h-5 w-5 text-yellow-500" />,
  [STATUS.DOWN]: <AlertCircle className="h-5 w-5 text-red-500" />,
  [STATUS.MAINTENANCE]: <RefreshCw className="h-5 w-5 text-blue-500" />,
  [STATUS.WAITING_LEADER_APPROVAL]: (
    <UserCheck className="h-5 w-5 text-purple-500" />
  ),
  [STATUS.WAITING_FOR_CUSTOMER]: <Users className="h-5 w-5 text-orange-500" />,
};

// เพิ่มคอมโพเนนต์ใหม่สำหรับแสดงจำนวนรวม
export const TotalMachinesSummaryCard = ({ total }) => {
  const { darkMode } = useDarkMode();

  return (
    <Card
      className={`shadow-md hover:shadow-lg transition-shadow ${
        darkMode ? "bg-gray-800 border-gray-700 text-white" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total count
            </p>
            <p className="text-2xl font-bold">{total || 0}</p>
            <p className="text-sm">Total machinery</p>
          </div>
          <div
            className={`p-3 rounded-full ${
              darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusSummaryCard = ({
  status,
  count,
  total,
  label,
  icon,
  colorClass,
}) => {
  const { darkMode } = useDarkMode();
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  const displayLabel = label || STATUS_LABELS[status];
  const displayIcon = icon || STATUS_ICONS[status];

  let displayColorClass = colorClass;
  if (!displayColorClass) {
    displayColorClass =
      typeof STATUS_COLORS[status] === "function"
        ? STATUS_COLORS[status](darkMode)
        : STATUS_COLORS[status];
  }

  return (
    <Card
      className={`shadow-md hover:shadow-lg transition-shadow ${
        darkMode ? "bg-gray-800 border-gray-700 text-white" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {displayLabel}
            </p>
            <p className="text-2xl font-bold">{count || 0}</p>
            {status !== "total" && (
              <p className="text-sm">{percentage}% of total</p>
            )}
            {status === "total" && (
              <p className="text-sm">Total machinery</p>
            )}
          </div>
          <div
            className={`p-3 rounded-full ${displayColorClass} bg-opacity-20`}
          >
            {displayIcon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSummaryCard;
