// src/app/components/MachineDownDashboard/utils/apiUtils.js

import axios from "axios";

export const fetchDashboardData = async (
  timeRange = "today",
  authHeader = {}
) => {
  try {
    const response = await axios.get(`/api/status-machine/dashboard/summary`, {
      params: { timeRange },
      headers: authHeader,
    });

    if (response.data.success) {
      const data = response.data.data;
      
      console.log("Raw API response:", data);
      
      const transformedIssues = data.issues.map(issue => ({
        id: issue.machine_downtime_id, 
        machine_downtime_id: issue.machine_downtime_id, 
        machine_id: issue.machine_id, 
        machineName: issue.machinename, 
        machine_name: issue.machinename,
        machine_number: issue.machine_number,
        problem_type: issue.problem_type,
        status: issue.status,
        issue: issue.issue,
        startTime: issue.startTime || new Date(issue.starttime).toLocaleString(),
        priority: issue.priority,
        assignedTo: issue.assignedto, 
        downtime: issue.downtime
      }));
      
      return {
        summary: data.summary,
        issues: transformedIssues
      };
    } else {
      throw new Error(
        response.data.message || "Failed to fetch dashboard data"
      );
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    return {
      summary: {
        totalDowntime: 0,
        activeIssues: 0,
        maintenanceIssues: 0,
        resolvedToday: 0,
        avgResolutionTime: 0,
      },
      issues: [],
    };
  }
};

export const fetchDowntimeLogs = async (
  filters = {},
  pagination = { page: 1, limit: 10 },
  authHeader = {}
) => {
  try {
    const response = await axios.get("/api/downtime", {
      params: {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      },
      headers: authHeader,
    });

    if (response.data.success) {
      return {
        logs: response.data.data,
        pagination: response.data.pagination,
      };
    } else {
      throw new Error(response.data.message || "Failed to fetch downtime logs");
    }
  } catch (error) {
    console.error("Error fetching downtime logs:", error);
    throw error;
  }
};

export const fetchDowntimeDetail = async (id, authHeader = {}) => {
  try {
    const response = await axios.get(`/api/downtime/${id}`, {
      headers: authHeader,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch downtime detail"
      );
    }
  } catch (error) {
    console.error("Error fetching downtime detail:", error);
    throw error;
  }
};

export const resolveDowntime = async (id, resolveData, authHeader = {}) => {
  try {
    const response = await axios.put(
      `/api/downtime/${id}/resolve`,
      resolveData,
      {
        headers: authHeader,
      }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to resolve downtime");
    }
  } catch (error) {
    console.error("Error resolving downtime:", error);
    throw error;
  }
};

export const addMaintenanceAction = async (actionData, authHeader = {}) => {
  try {
    const response = await axios.post(
      `/api/downtime/maintenance-actions`,
      actionData,
      {
        headers: authHeader,
      }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to add maintenance action"
      );
    }
  } catch (error) {
    console.error("Error adding maintenance action:", error);
    throw error;
  }
};

export const uploadFile = async (file, authHeader = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/upload/single", formData, {
      headers: {
        ...authHeader,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      return response.data.filePath;
    } else {
      throw new Error(response.data.message || "Failed to upload file");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const fetchDowntimeStats = async (
  startDate,
  endDate,
  authHeader = {}
) => {
  try {
    const response = await axios.get("/api/downtime/stats/by-machine", {
      params: { start_date: startDate, end_date: endDate },
      headers: authHeader,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch downtime statistics"
      );
    }
  } catch (error) {
    console.error("Error fetching downtime statistics:", error);
    return [];
  }
};

export const assignMachineIssue = async (
  issueId,
  technicianData,
  getAuthHeader
) => {
  try {
    const response = await axios.post(
      `/api/downtime/${issueId}/assign`,
      {
        ...technicianData,
        status: "maintenance",
      },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning issue:", error);
    throw error;
  }
};

export const resolveMachineIssue = async (
  issueId,
  resolutionData,
  getAuthHeader
) => {
  try {
    const response = await axios.post(
      `/api/downtime/${issueId}/resolve`,
      {
        ...resolutionData,
        status: "waiting_leader_approval",
      },
      { headers: typeof getAuthHeader === 'function' ? getAuthHeader() : getAuthHeader }
    );
    return response.data;
  } catch (error) {
    console.error("Error resolving issue:", error);
    throw error;
  }
};

export const assignDowntime = async (downtimeId, assignData, authHeader) => {
  try {
    const response = await axios.post(
      `/api/downtime/${downtimeId}/assign`,
      assignData,
      { headers: authHeader }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning downtime:", error);
    throw error;
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
