// src/controllers/logSafetyController.js

const logSafetyService = require("../services/logSafetyService");

const logsafetyController = {
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

      const logs = await logSafetyService.getPublicLogs({
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
      const log = await logSafetyService.getPublicLogById(numericId);

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
      const newLog = await logSafetyService.createLog(req.body);
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
      const updatedLog = await logSafetyService.updateLog(id, req.body);
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
      const result = await logSafetyService.deleteLog(id);
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

      const exists = await logSafetyService.checkDailyMachineLogExists(
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
};

module.exports = logsafetyController;
