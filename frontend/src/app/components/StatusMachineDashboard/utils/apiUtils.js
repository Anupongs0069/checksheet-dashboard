// src/app/components/StatusMachineDashboard/utils/apiUtils.js

import axios from "axios";
import { STATUS } from "./helpers";

const mapApiStatusToUiStatus = (status) => {
  // Map API status to UI status
  switch (status) {
    case "active":
    case "in_progress":
      return STATUS.DOWN;
    case "maintenance":
      return STATUS.MAINTENANCE;
    case "idle":
      return STATUS.IDLE;
    case "waiting_leader_approval":
      return STATUS.WAITING_LEADER_APPROVAL;
    case "waiting_for_customer":
      return STATUS.WAITING_FOR_CUSTOMER;
    case "running":
    default:
      return STATUS.RUNNING;
  }
};

export const updateMachineStatus = async (
  machineId,
  newStatus,
  updatedBy = "UI System"
) => {
  try {
    if (!machineId) {
      throw new Error("Machine ID is required");
    }

    // ใช้ API ใหม่ที่อัปเดตสถานะโดยตรง
    const response = await axios.put(
      `/api/status-machine/${machineId}/status`,
      {
        status: newStatus,
        updated_by: updatedBy,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating machine status:", error);
    throw error;
  }
};

export const fetchDashboardSummary = async (timeRange = "today") => {
  try {
    const response = await axios.get(
      `/api/status-machine/dashboard/summary?timeRange=${timeRange}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

export const fetchMachines = async () => {
  try {
    const response = await axios.get("/api/status-machine/all");

    return response.data.machines.map((machine) => {
      let finalStatus;

      if (machine.safety_status === "idle") {
        finalStatus = STATUS.IDLE;
      } else {
        finalStatus = mapApiStatusToUiStatus(machine.status);
      }

      return {
        id: machine.machine_id,
        machine_name: machine.machine_name || machine.machine_full_name || "-",
        machine_number: machine.machine_number || "-",
        model: machine.model || "-",
        department: machine.department || "-",
        status: finalStatus,
        status_source: machine.status_source || null,
        last_downtime: machine.last_downtime || null,
        safety_status: machine.safety_status || null,
        last_safety_check: machine.last_safety_check || null,
        last_safety_check_shift: machine.last_safety_check_shift || null,
      };
    });
  } catch (error) {
    console.error("Error fetching machines:", error);
    throw error;
  }
};

export const fetchDowntimeStatsByMachine = async (startDate, endDate) => {
  try {
    const response = await axios.get(
      `/api/status-machine/stats/by-machine?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching downtime stats by machine:", error);
    throw error;
  }
};

export const fetchTopDowntimeReasons = async (
  startDate,
  endDate,
  limit = 10
) => {
  try {
    const response = await axios.get(
      `/api/status-machine/stats/top-reasons?start_date=${startDate}&end_date=${endDate}&limit=${limit}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top downtime reasons:", error);
    throw error;
  }
};

export const fetchDowntimeTimeSeries = async (timeRange = "today") => {
  try {
    const response = await axios.get(
      `/api/status-machine/dashboard/time-series?timeRange=${timeRange}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching downtime time series:", error);
    throw error;
  }
};

export const fetchDowntimeByReason = async (timeRange = "today") => {
  try {
    const response = await axios.get(
      `/api/status-machine/dashboard/by-reason?timeRange=${timeRange}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching downtime by reason:", error);
    throw error;
  }
};

export const createDowntime = async (downtimeData) => {
  try {
    const response = await axios.post("/api/downtime", downtimeData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating downtime record:", error);
    throw error;
  }
};

export const fetchMachineWithHistory = async (machineId) => {
  try {
    // เรียกข้อมูลจาก API เดิม
    const machineResponse = await axios.get(`/api/status-machine/${machineId}`);
    const downtimeResponse = await axios.get(
      `/api/downtime?machine_id=${machineId}&limit=10`
    );

    // เรียกข้อมูลเพิ่มเติมจาก API ใหม่
    const latestInfoResponse = await fetchMachineLatestInfo(machineId);

    const machineData = machineResponse.data.data;
    
    if (machineData) {
      if (machineData.safety_status === "idle") {
        machineData.status = STATUS.IDLE;
      } else {
        machineData.status = mapApiStatusToUiStatus(machineData.status);
      }
      
      // เพิ่มข้อมูลจาก API ใหม่เข้าไปใน machineData
      if (latestInfoResponse && latestInfoResponse.data) {
        // รวมข้อมูลจาก API ใหม่เข้ากับข้อมูลเดิม
        Object.assign(machineData, latestInfoResponse.data);
      }
    }

    return {
      machine: {
        success: true,
        data: machineData
      },
      downtimeHistory: downtimeResponse.data.data,
    };
  } catch (error) {
    console.error("Error fetching machine with history:", error);
    throw error;
  }
};

// สร้างข้อมูลจำลองสำหรับการพัฒนา (กรณี API ยังไม่พร้อมใช้งาน)
export const generateMockMachines = (count) => {
  const STATUS = {
    RUNNING: "running",
    IDLE: "idle",
    DOWN: "down",
    MAINTENANCE: "maintenance",
    WAITING_LEADER_APPROVAL: "waiting_leader_approval",
    WAITING_FOR_CUSTOMER: "waiting_for_customer",
  };

  const departments = [
    "แผนกผลิต A",
    "แผนกผลิต B",
    "แผนกบรรจุ",
    "แผนกคลังสินค้า",
  ];
  const statuses = Object.values(STATUS);

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    machine_name: `เครื่องจักร ${i + 1}`,
    machine_number: `MC-${1000 + i}`,
    model: `Model XYZ-${1000 + i}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    uptime_hours: Math.floor(Math.random() * 1000),
    last_downtime: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 86400000)
    ).toISOString(),
    details: {
      serialNumber: `SN-${100000 + i}`,
      installedDate: "2023-01-01",
      manufacturer: "บริษัท อุตสาหกรรมไทย จำกัด",
    },
  }));
};

// สร้างข้อมูลจำลองสำหรับสรุป Dashboard
export const generateMockDashboardSummary = () => {
  return {
    summary: {
      totalDowntime: parseFloat((Math.random() * 100).toFixed(1)),
      activeIssues: Math.floor(Math.random() * 10),
      resolvedToday: Math.floor(Math.random() * 5),
      avgResolutionTime: parseFloat((Math.random() * 10).toFixed(1)),
    },
    issues: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      machineName: `เครื่องจักร ${i + 1}`,
      status: Math.random() > 0.5 ? "active" : "in_progress",
      issue: `ปัญหา ${
        [
          "มอเตอร์ไม่ทำงาน",
          "ระบบควบคุมขัดข้อง",
          "สายพานหลุด",
          "ความร้อนสูงเกินกำหนด",
          "น้ำมันรั่ว",
        ][i % 5]
      }`,
      startTime: new Date(
        Date.now() - Math.floor(Math.random() * 86400000)
      ).toLocaleString(),
      priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
      assignedTo: `ช่างทดสอบ ${Math.floor(Math.random() * 5) + 1}`,
      downtime: (Math.random() * 10).toFixed(1),
    })),
  };
};

// สร้างข้อมูลจำลองสำหรับสถิติตามเครื่องจักร
export const generateMockDowntimeStatsByMachine = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    machine_name: `เครื่องจักร ${i + 1}`,
    machine_number: `MC-${1000 + i}`,
    model: `Model XYZ-${1000 + i}`,
    incident_count: Math.floor(Math.random() * 20),
    total_downtime_minutes: Math.floor(Math.random() * 1000),
    avg_downtime_minutes: Math.floor(Math.random() * 100),
  }));
};

// สร้างข้อมูลจำลองสำหรับสาเหตุการหยุดทำงาน
export const generateMockDowntimeReasons = () => {
  const categories = [
    "เครื่องกล",
    "ไฟฟ้า",
    "ระบบควบคุม",
    "วัตถุดิบ",
    "ผู้ปฏิบัติงาน",
  ];
  const reasons = [
    "มอเตอร์เสีย",
    "สายพานหลุด",
    "ใบมีดเสียหาย",
    "ไฟฟ้าดับ",
    "เซนเซอร์เสีย",
    "ระบบควบคุมค้าง",
    "วัตถุดิบติด",
    "วัตถุดิบหมด",
    "การปรับตั้งผิดพลาด",
    "อุบัติเหตุ",
    "การซ่อมบำรุงตามกำหนด",
  ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    category: categories[Math.floor(Math.random() * categories.length)],
    reason: reasons[i % reasons.length],
    issue_count: Math.floor(Math.random() * 20) + 1,
    total_downtime: parseFloat((Math.random() * 100).toFixed(1)),
  }));
};

// สร้างข้อมูลจำลองสำหรับแนวโน้มตามเวลา
export const generateMockTimeSeries = (timeRange) => {
  let periods;

  switch (timeRange) {
    case "today":
      periods = Array.from(
        { length: 24 },
        (_, i) => `${String(i).padStart(2, "0")}`
      );
      break;
    case "week":
      periods = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });
      break;
    case "month":
    default:
      periods = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split("T")[0];
      });
      break;
  }

  return periods.map((period) => ({
    time_period: period,
    issue_count: Math.floor(Math.random() * 5),
    total_downtime: parseFloat((Math.random() * 8).toFixed(1)),
  }));
};

export const fetchMachineLatestInfo = async (machineId) => {
  try {
    const response = await axios.get(`/api/machine-maintenance/${machineId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching machine latest info:", error);
    throw error;
  }
};