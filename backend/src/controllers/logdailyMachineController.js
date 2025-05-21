// src/controllers/logdailyMachineController.js

const logdailyMachineService = require("../services/logdailyMachineService");

const logdailyMachineController = {
  // Public Methods
  async getPublicDailyMachineLogs(req, res) {
    try {
      const { customer, product, startDate, endDate } = req.query;

      // Log request parameters
      console.log("Request parameters:", {
        customer,
        product,
        startDate,
        endDate,
      });

      const logs = await logdailyMachineService.getPublicLogs({
        customer,
        product,
        startDate,
        endDate,
      });

      res.json(logs);
    } catch (error) {
      console.error("Error in getPublicDailyMachineLogs:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  async getPublicDailyMachineLogById(req, res) {
    try {
      const { id } = req.params;

      // เพิ่มการตรวจสอบ id
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format: ID must be a number",
        });
      }

      const numericId = parseInt(id);
      const log = await logdailyMachineService.getPublicLogById(numericId);

      if (!log) {
        return res.status(404).json({ message: "Log not found" });
      }

      res.json(log);
    } catch (error) {
      console.error("Error in getPublicDailyMachineLogById:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async createDailyMachineLog(req, res) {
    try {
      const newLog = await logdailyMachineService.createLog(req.body);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error in createDailyMachineLog:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Protected Methods
  async updateDailyMachineLog(req, res) {
    try {
      const { id } = req.params;
      const updatedLog = await logdailyMachineService.updateLog(id, req.body);
      if (!updatedLog) {
        return res.status(404).json({ message: "Log not found" });
      }
      res.json(updatedLog);
    } catch (error) {
      console.error("Error in updateDailyMachineLog:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async deleteDailyMachineLog(req, res) {
    try {
      const { id } = req.params;
      const result = await logdailyMachineService.deleteLog(id);
      if (!result) {
        return res.status(404).json({ message: "Log not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error in deleteDailyMachineLog:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async checkDailyMachineLog(req, res) {
    try {
      const { machine_id, date, shift } = req.query;

      if (!machine_id || !date || !shift) {
        return res.status(400).json({
          success: false,
          message: "Machine ID, date and shift are required",
        });
      }

      if (isNaN(parseInt(machine_id))) {
        return res.status(400).json({
          success: false,
          message: "Machine ID must be a number",
        });
      }

      const exists = await logdailyMachineService.checkDailyMachineLogExists(
        parseInt(machine_id),
        date,
        shift
      );

      return res.status(200).json({
        success: true,
        exists: exists,
      });
    } catch (error) {
      console.error("Error checking daily machine log:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check daily machine log status",
      });
    }
  },

  async getLatestInspectionHistory(req, res) {
    try {
      const { machine_name, model } = req.query;

      console.log("Requested machine details:", { machine_name, model });

      if (!machine_name || !model) {
        return res.status(400).json({
          success: false,
          message: "Machine name and model are required",
        });
      }

      const latestHistory =
        await logdailyMachineService.getLatestMachineInspectionHistory(
          machine_name,
          model
        );

      if (!latestHistory) {
        return res.status(404).json({
          success: false,
          message: "No inspection history found for this machine",
        });
      }

      res.json(latestHistory);
    } catch (error) {
      console.error("Error in getLatestInspectionHistory:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getInspectionHistoryById(req, res) {
    try {
      const { id } = req.params;
      console.log("Requested inspection history by ID:", id);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Inspection ID is required",
        });
      }

      const inspectionHistory =
        await logdailyMachineService.getInspectionHistoryById(id);

      if (!inspectionHistory) {
        return res.status(404).json({
          success: false,
          message: "No inspection history found with this ID",
        });
      }

      res.json(inspectionHistory);
    } catch (error) {
      console.error("Error in getInspectionHistoryById:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = logdailyMachineController;
