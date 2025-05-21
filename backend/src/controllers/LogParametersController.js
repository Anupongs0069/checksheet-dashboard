// ./src/controllers/LogParametersController.js

const LogParametersService = require("../services/LogParametersService");

const LogParametersController = {
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

      const logs = await LogParametersService.getPublicLogs({
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
      const log = await LogParametersService.getPublicLogById(numericId);

      if (!log) {
        return res.status(404).json({ message: "Log not found" });
      }

      res.json(log);
    } catch (error) {
      console.error("Error in getPublicDailyMachineLogById:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getInspectionAttachments(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format: ID must be a number",
        });
      }

      const attachments = await LogParametersService.getInspectionAttachments(
        parseInt(id)
      );
      res.json(attachments);
    } catch (error) {
      console.error("Error in getInspectionAttachments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getParameterItems(req, res) {
    try {
      const { machineId, programName } = req.query;

      if (!machineId || isNaN(parseInt(machineId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid machine ID format: ID must be a number",
        });
      }

      const items = await LogParametersService.getParameterItems(
        parseInt(machineId),
        programName
      );
      res.json(items);
    } catch (error) {
      console.error("Error in getParameterItems:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async createDailyMachineLog(req, res) {
    try {
      const newLog = await LogParametersService.createLog(req.body);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error in createDailyMachineLog:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async createAttachment(req, res) {
    try {
      const newAttachmentId = await LogParametersService.createAttachment(
        req.body
      );
      res.status(201).json({ id: newAttachmentId });
    } catch (error) {
      console.error("Error in createAttachment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Protected Methods
  async updateDailyMachineLog(req, res) {
    try {
      const { id } = req.params;
      const updatedLog = await LogParametersService.updateLog(id, req.body);
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
      const result = await LogParametersService.deleteLog(id);
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

      const exists = await LogParametersService.checkDailyMachineLogExists(
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
  async getSimpleParameterItems(req, res) {
    try {
      const { machine_model_id, programName } = req.query;

      if (!machine_model_id || isNaN(parseInt(machine_model_id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid machine model ID format: ID must be a number",
        });
      }

      const items = await LogParametersService.getSimpleParameterItems(
        parseInt(machine_model_id),
        programName
      );
      res.json(items);
    } catch (error) {
      console.error("Error in getSimpleParameterItems:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  async getInspectionResults(req, res) {
    try {
      const { id } = req.params;
  
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format: ID must be a number",
        });
      }
  
      const results = await LogParametersService.getInspectionResults(parseInt(id));
      res.json(results);
    } catch (error) {
      console.error("Error in getInspectionResults:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = LogParametersController;
