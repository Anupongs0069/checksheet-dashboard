// src/app/components/StatusMachineDashboard/ui-components/StatusIndicator.jsx

import React from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { STATUS, STATUS_COLORS, STATUS_LABELS } from "../utils/helpers";
import { useDarkMode } from "@/app/components/DarkModeProvider";

// ไอคอนที่แสดงตามสถานะ
export const STATUS_ICONS = {
  [STATUS.RUNNING]: <Activity className="h-5 w-5 text-green-500" />,
  [STATUS.IDLE]: <Clock className="h-5 w-5 text-yellow-500" />,
  [STATUS.DOWN]: <AlertCircle className="h-5 w-5 text-red-500" />,
  [STATUS.MAINTENANCE]: <RefreshCw className="h-5 w-5 text-blue-500" />,
  [STATUS.WAITING_LEADER_APPROVAL]: (
    <UserCheck className="h-5 w-5 text-purple-500" />
  ),
  [STATUS.WAITING_FOR_CUSTOMER]: <Users className="h-5 w-5 text-orange-500" />,
};

const StatusIndicator = ({ status, size = "sm" }) => {
  const { darkMode } = useDarkMode();

  const normalizedStatus = Object.values(STATUS).includes(status)
    ? status
    : STATUS.RUNNING;

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };

  return (
    <div
      className={`inline-flex rounded-full items-center ${sizeClasses[size]} ${
        STATUS_COLORS[normalizedStatus]
      } ${darkMode ? "bg-opacity-30" : "bg-opacity-20"}`}
    >
      {STATUS_ICONS[normalizedStatus]}
      <span>{STATUS_LABELS[normalizedStatus]}</span>
    </div>
  );
};

export default StatusIndicator;
