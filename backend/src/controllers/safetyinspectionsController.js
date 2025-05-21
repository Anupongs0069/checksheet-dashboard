// src/controllers/safetyinspectionsController.js

const safetyinspectionsService = require("../services/safetyinspectionsService");

const safetyinspectionsController = {
  // Pull up all checklists
  async getAllInspections(req, res) {
    try {
      const result = await safetyinspectionsService.getAllInspections();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting safety inspections:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get safety inspections",
      });
    }
  },

  // Pull checklist by ID
  async getInspectionById(req, res) {
    try {
      const { id } = req.params;
      const result = await safetyinspectionsService.getInspectionById(id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Safety Inspection not found",
        });
      }
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting safety inspection by ID:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get safety inspection",
      });
    }
  },

  // Pull up safety inspection list by machine
  async getInspectionsByMachine(req, res) {
    try {
      const { machine_id } = req.params;
      const result = await safetyinspectionsService.getInspectionsByMachine(
        machine_id
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting safety inspections by machine:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get machine safety inspections",
      });
    }
  },

  // Pull checklist by status
  async getInspectionsByStatus(req, res) {
    try {
      const { status } = req.params;
      const result = await safetyinspectionsService.getInspectionsByStatus(
        status
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting safety inspections by status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get status safety inspections",
      });
    }
  },

  // Create a new checklist
  async createInspection(req, res) {
    try {
      const records = Array.isArray(req.body) ? req.body : [req.body];

      for (const record of records) {
        const { machine_id, checked_by, status } = record;

        if (!machine_id || !checked_by || !status) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields: machine_id, checked_by, status",
          });
        }

        const validStatuses = ["pass", "fail", "idle"];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({
            success: false,
            message: "Invalid status value",
          });
        }
      }

      const results = [];
      for (const record of records) {
        const result = await safetyinspectionsService.createInspection(record);
        results.push(result);
      }

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error creating safety inspection:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not create safety inspection",
      });
    }
  },

  // Save attachments

  async createInspectionAttachments(req, res) {
    try {
      console.log("Creating safety inspection attachments:", req.body);

      const records = Array.isArray(req.body) ? req.body : [req.body];

      const checkInspectionQuery = `
      SELECT id FROM safety_inspection_history WHERE id = $1
    `;

      const db = require("../config/database");

      for (const record of records) {
        const { safety_inspection_id, model_safetylist_item_id, description } =
          record;

        if (
          !safety_inspection_id ||
          !model_safetylist_item_id ||
          !description
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Missing required fields: safety_inspection_id, model_safetylist_item_id, description",
          });
        }

        const checkResult = await db.query(checkInspectionQuery, [
          safety_inspection_id,
        ]);
        if (checkResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Safety Inspection ID ${safety_inspection_id} not found`,
          });
        }
      }

      const results = [];
      for (const record of records) {
        const query = `
        INSERT INTO safety_inspection_attachments (
          safety_inspection_id,
          model_safetylist_item_id,
          description,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

        const values = [
          record.safety_inspection_id,
          record.model_safetylist_item_id,
          record.description,
        ];
        const result = await db.query(query, values);
        results.push(result.rows[0]);
      }

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error creating safety inspection attachments:", error);
      res.status(500).json({
        success: false,
        message:
          error.message || "Could not create safety inspection attachments",
      });
    }
  },

  // Update status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const validStatuses = ["pass", "fail", "idle"];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const result = await safetyinspectionsService.updateStatus(
        id,
        status.toLowerCase()
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Safety Inspection not found",
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not update status",
      });
    }
  },

  // Delete checklist
  async deleteInspection(req, res) {
    try {
      const { id } = req.params;
      await safetyinspectionsService.deleteInspection(id);
      res.json({
        success: true,
        message: "Safety Inspection deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting safety inspection:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not delete safety inspection",
      });
    }
  },

  // Pull safety inspection history
  async getInspectionHistory(req, res) {
    try {
      const { machine_id, start_date, end_date } = req.query;
      const options = {
        machine_id,
        start_date,
        end_date,
      };
      const result = await safetyinspectionsService.getInspectionHistory(
        options
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting safety inspection history:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get safety inspection history",
      });
    }
  },

  async getPublicChecklistByParams(req, res) {
    try {
      const { machineName, model, frequencies } = req.query;

      const frequencyArray = frequencies ? frequencies.split(",") : ["daily"];

      const validFrequencies = [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "6_months",
        "yearly",
      ];
      const invalidFrequencies = frequencyArray.filter(
        (f) => !validFrequencies.includes(f)
      );

      if (invalidFrequencies.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid frequencies: ${invalidFrequencies.join(", ")}`,
        });
      }

      const result = await safetyinspectionsService.getChecklistByFrequencies(
        machineName,
        model,
        frequencyArray
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting checklist:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get checklist",
      });
    }
  },

  // Pull safety inspection statistics
  async getInspectionStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const result = await safetyinspectionsService.getInspectionStats({
        start_date,
        end_date,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting safety inspection stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get safety inspection statistics",
      });
    }
  },

  async checkDailySafetyLog(req, res) {
    try {
      const { machine_id, date, shift } = req.query;
      if (!machine_id || !date || !shift) {
        return res.status(400).json({
          success: false,
          message: "Machine ID, date and shift are required",
        });
      }

      const exists = await safetyinspectionsService.checkDailySafetyLog(
        machine_id,
        date,
        shift
      );

      return res.status(200).json({
        success: true,
        exists: exists,
      });
    } catch (error) {
      console.error("Error checking daily safety log:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check daily safety log status",
      });
    }
  },

  async getInspectionAttachments(req, res) {
    try {
      const { id } = req.params;
      const attachments = await safetyinspectionsService.getSafetyInspectionAttachments(id);
      res.json({ data: attachments });
    } catch (error) {
      console.error("Error fetching safety inspection attachments:", error);
      res.status(500).json({ message: "Error fetching attachments" });
    }
  },
};

module.exports = safetyinspectionsController;
