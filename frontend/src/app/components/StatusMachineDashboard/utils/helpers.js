// src/app/components/StatusMachineDashboard/utils/helpers.js

import { useDarkMode } from "@/app/components/DarkModeProvider";

// สถานะที่เป็นไปได้
export const STATUS = {
  RUNNING: "running",
  IDLE: "idle",
  DOWN: "down",
  MAINTENANCE: "maintenance",
  WAITING_LEADER_APPROVAL: "waiting_leader_approval",
  WAITING_FOR_CUSTOMER: "waiting_for_customer",
};

export const STATUS_COLORS = {
  [STATUS.RUNNING]: (darkMode) => darkMode ? "bg-green-500 text-white" : "bg-green-500 text-black",
  [STATUS.IDLE]: (darkMode) => darkMode ? "bg-yellow-500 text-white" : "bg-yellow-500 text-black",
  [STATUS.DOWN]: (darkMode) => darkMode ? "bg-red-500 text-white" : "bg-red-500 text-black",
  [STATUS.MAINTENANCE]: (darkMode) => darkMode ? "bg-blue-500 text-white" : "bg-blue-500 text-black",
  [STATUS.WAITING_LEADER_APPROVAL]: (darkMode) => darkMode ? "bg-purple-500 text-white" : "bg-purple-500 text-black",
  [STATUS.WAITING_FOR_CUSTOMER]: (darkMode) => darkMode ? "bg-orange-500 text-white" : "bg-orange-500 text-black"
};

export const STATUS_LABELS = {
  [STATUS.RUNNING]: "Operating Normally",
  [STATUS.IDLE]: "Idle",
  [STATUS.DOWN]: "Machine Breakdown",
  [STATUS.MAINTENANCE]: "Under Maintenance",
  [STATUS.WAITING_LEADER_APPROVAL]: "Waiting Leader Approval",
  [STATUS.WAITING_FOR_CUSTOMER]: "Awaiting Customer Response",
};

export const MachineStatusComponent = ({ status }) => {
  const { darkMode } = useDarkMode();

  const colorClass = STATUS_COLORS[status](darkMode);

  return (
    <div className={`px-2 py-1 rounded-full ${colorClass}`}>
      {STATUS_LABELS[status]}
    </div>
  );
};

export const mapApiStatusToUiStatus = (apiStatus) => {
  if (apiStatus === "active" || apiStatus === "in_progress") {
    return STATUS.DOWN;
  } else if (apiStatus === "maintenance") {
    return STATUS.MAINTENANCE;
  } else if (apiStatus === "idle") {
    return STATUS.IDLE;
  } else {
    return STATUS.RUNNING;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
};

// ฟอร์แมตวันที่เป็นภาษาไทย
export const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// คำนวณเวลาที่ผ่านไป (เช่น "2 ชั่วโมงที่แล้ว")
export const getTimeAgo = (dateString) => {
  if (!dateString) return "-";

  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;

  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
};

// แปลงเวลาเป็นหน่วยชั่วโมงและนาที
export const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return "-";

  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${mins} นาที`;
  } else if (mins === 0) {
    return `${hours} ชั่วโมง`;
  } else {
    return `${hours} ชั่วโมง ${mins} นาที`;
  }
};

// แปลงระดับความสำคัญเป็นข้อความภาษาไทย
export const getPriorityLabel = (priority) => {
  const priorityLabels = {
    high: "สูง",
    medium: "ปานกลาง",
    low: "ต่ำ",
  };

  return priorityLabels[priority] || priority;
};

// สร้างช่วงวันที่สำหรับการดึงข้อมูล
export const getDateRangeFromTimeRange = (timeRange) => {
  const endDate = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

// คำนวณเปอร์เซ็นต์
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// กรองและจัดเรียงข้อมูลเครื่องจักร
export const filterAndSortMachines = (machines, filters) => {
  const { searchTerm, filterStatus, selectedDepartment, sortBy } = filters;

  // กรองข้อมูล
  const filteredMachines = machines.filter((machine) => {
    const matchesStatus =
      filterStatus === "all" || machine.status === filterStatus;
    const matchesSearch =
      machine.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machine_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || machine.department === selectedDepartment;

    return matchesStatus && matchesSearch && matchesDepartment;
  });

  // จัดเรียงข้อมูล
  return [...filteredMachines].sort((a, b) => {
    if (sortBy === "machine_name") {
      return a.machine_name.localeCompare(b.machine_name);
    } else if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    } else if (sortBy === "department") {
      return a.department.localeCompare(b.department);
    } else if (sortBy === "last_downtime") {
      const dateA = a.last_downtime ? new Date(a.last_downtime) : new Date(0);
      const dateB = b.last_downtime ? new Date(b.last_downtime) : new Date(0);
      return dateB - dateA;
    }
    return 0;
  });
};