// ./src/controllers/downtimeController.js

const DowntimeService = require("../services/downtimeService");

const createDowntime = async (req, res) => {
  try {
    const downtimeData = req.body;

    if (
      !downtimeData.machine_id ||
      !downtimeData.problem_description ||
      !downtimeData.reported_by
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields are missing: machine_id, problem_description, reported_by",
      });
    }

    const result = await DowntimeService.createDowntime(downtimeData);

    res.status(201).json({
      success: true,
      message: "Downtime record created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating downtime record:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create downtime record",
    });
  }
};

// อัปเดตเหตุการณ์การหยุดทำงาน
const updateDowntime = async (req, res) => {
  try {
    const { id } = req.params;
    const downtimeData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Downtime ID is required",
      });
    }

    const result = await DowntimeService.updateDowntime(id, downtimeData);

    res.status(200).json({
      success: true,
      message: "Downtime record updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating downtime record:", error);
    if (error.message === "Downtime record not found") {
      return res.status(404).json({
        success: false,
        message: "Downtime record not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update downtime record",
    });
  }
};

const resolveDowntime = async (req, res) => {
  try {
    const { id } = req.params;
    const resolutionData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Downtime ID is required",
      });
    }

    if (!resolutionData.solution_description) {
      return res.status(400).json({
        success: false,
        message: "Solution description is required",
      });
    }

    const result = await DowntimeService.resolveDowntime(id, resolutionData);

    res.status(200).json({
      success: true,
      message: "Downtime resolved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error resolving downtime:", error);
    if (error.message === "Downtime record not found") {
      return res.status(404).json({
        success: false,
        message: "Downtime record not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resolve downtime",
    });
  }
};

const addMaintenanceAction = async (req, res) => {
  try {
    const actionData = req.body;

    if (
      !actionData.downtime_id ||
      !actionData.action_description ||
      !actionData.performed_by
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields are missing: downtime_id, action_description, performed_by",
      });
    }

    const result = await DowntimeService.addMaintenanceAction(actionData);

    res.status(201).json({
      success: true,
      message: "Maintenance action added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding maintenance action:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add maintenance action",
    });
  }
};

// ดึงข้อมูลเหตุการณ์การหยุดทำงานตาม ID
const getDowntimeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Downtime ID is required",
      });
    }

    const result = await DowntimeService.getDowntimeById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Downtime record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching downtime record:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch downtime record",
    });
  }
};

const getDowntimeList = async (req, res) => {
  try {

    const filters = {
      machine_id: req.query.machine_id,
      status: req.query.status,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      sort_by: req.query.sort_by,
      sort_dir: req.query.sort_dir,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    };

    const result = await DowntimeService.getDowntimeList(filters);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching downtime list:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch downtime list",
    });
  }
};

const createDowntimeReason = async (req, res) => {
  try {
    const reasonData = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!reasonData.category || !reasonData.reason) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing: category, reason",
      });
    }

    const result = await DowntimeService.createDowntimeReason(reasonData);

    res.status(201).json({
      success: true,
      message: "Downtime reason created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating downtime reason:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create downtime reason",
    });
  }
};

const getDowntimeReasons = async (req, res) => {
  try {
    const result = await DowntimeService.getDowntimeReasons();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching downtime reasons:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch downtime reasons",
    });
  }
};

const getDowntimeStatsByMachine = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const result = await DowntimeService.getDowntimeStatsByMachine(
      start_date,
      end_date
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching downtime stats by machine:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch downtime stats",
    });
  }
};

const getTopDowntimeReasons = async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const result = await DowntimeService.getTopDowntimeReasons(
      start_date,
      end_date,
      parseInt(limit) || 10
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching top downtime reasons:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch top downtime reasons",
    });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const { timeRange = "today" } = req.query;

    const result = await DowntimeService.getDashboardSummary(timeRange);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard summary",
    });
  }
};

const getDowntimeTimeSeries = async (req, res) => {
  try {
    const { timeRange = "today" } = req.query;

    const result = await DowntimeService.getDowntimeTimeSeries(timeRange);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching downtime time series:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch downtime time series",
    });
  }
};

const getDowntimeByReason = async (req, res) => {
  try {
    const { timeRange = "today" } = req.query;

    const result = await DowntimeService.getDowntimeByReason(timeRange);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching downtime by reason:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch downtime by reason",
    });
  }
};

const updateMachineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Machine ID and status are required"
      });
    }

    const result = await DowntimeService.updateMachineStatus(id, status);

    res.status(200).json({
      success: true,
      message: "Machine status updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Error updating machine status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update machine status"
    });
  }
};

module.exports = {
  createDowntime,
  updateDowntime,
  resolveDowntime,
  addMaintenanceAction,
  getDowntimeById,
  getDowntimeList,
  createDowntimeReason,
  getDowntimeReasons,
  getDowntimeStatsByMachine,
  getTopDowntimeReasons,
  getDashboardSummary,
  getDowntimeTimeSeries,
  getDowntimeByReason,
  updateMachineStatus,
};
