// src/controllers/inspectionsController.js

const inspectionsService = require("../services/inspectionsService");

const inspectionsController = {
  // Pull up all checklists
  async getAllInspections(req, res) {
    try {
      const result = await inspectionsService.getAllInspections();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting inspections:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get inspections",
      });
    }
  },

  // Pull checklist by ID
  async getInspectionById(req, res) {
    try {
      const { id } = req.params;
      const result = await inspectionsService.getInspectionById(id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Inspection not found",
        });
      }
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting inspection by ID:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get inspection",
      });
    }
  },

  // Pull up inspection list by machine
  async getInspectionsByMachine(req, res) {
    try {
      const { machine_id } = req.params;
      const result = await inspectionsService.getInspectionsByMachine(
        machine_id
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting inspections by machine:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get machine inspections",
      });
    }
  },

  // Pull checklist by status
  async getInspectionsByStatus(req, res) {
    try {
      const { status } = req.params;
      const result = await inspectionsService.getInspectionsByStatus(status);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting inspections by status:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get status inspections",
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
      
      // ตรวจสอบค่า frequencies ถ้าจำเป็น (optional)
      /* 
      const frequencyFields = ['is_daily', 'is_weekly', 'is_monthly', 'is_quarterly', 'is_6_months', 'is_yearly'];
      for (const field of frequencyFields) {
        if (record[field] !== undefined && typeof record[field] !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: `Field ${field} must be a boolean value`
          });
        }
      }
      */
    }
    
    const results = [];
    for (const record of records) {
      console.log("Processing record:", record);
      const result = await inspectionsService.createInspection(record);
      results.push(result);
    }
    
    res.status(201).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error creating inspection:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Could not create inspection",
    });
  }
},

  // Save attachments

  async createInspectionAttachments(req, res) {
    try {
      console.log("Creating inspection attachments:", req.body);

      const records = Array.isArray(req.body) ? req.body : [req.body];

      const checkInspectionQuery = `
      SELECT id FROM inspection_history WHERE id = $1
    `;

      const db = require("../config/database");

      for (const record of records) {
        const { inspection_id, model_checklist_item_id, description } = record;

        if (!inspection_id || !model_checklist_item_id || !description) {
          return res.status(400).json({
            success: false,
            message:
              "Missing required fields: inspection_id, model_checklist_item_id, description",
          });
        }

        const checkResult = await db.query(checkInspectionQuery, [
          inspection_id,
        ]);
        if (checkResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Inspection ID ${inspection_id} not found`,
          });
        }
      }

      const results = [];
      for (const record of records) {
        const query = `
        INSERT INTO inspection_attachments (
          inspection_id,
          model_checklist_item_id,
          description,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

        const values = [
          record.inspection_id,
          record.model_checklist_item_id,
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
      console.error("Error creating inspection attachments:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not create inspection attachments",
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

      const result = await inspectionsService.updateStatus(
        id,
        status.toLowerCase()
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Inspection not found",
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
      await inspectionsService.deleteInspection(id);
      res.json({
        success: true,
        message: "Inspection deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting inspection:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not delete inspection",
      });
    }
  },

  // Pull inspection history
  async getInspectionHistory(req, res) {
    try {
      const { machine_id, start_date, end_date } = req.query;
      const options = {
        machine_id,
        start_date,
        end_date,
      };
      const result = await inspectionsService.getInspectionHistory(options);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting inspection history:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get inspection history",
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

      const result = await inspectionsService.getChecklistByFrequencies(
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

  // Pull inspection statistics
  async getInspectionStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const result = await inspectionsService.getInspectionStats({
        start_date,
        end_date,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error getting inspection stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Could not get inspection statistics",
      });
    }
  },

  async getInspectionAttachments(req, res) {
    try {
      const { id } = req.params;
      const attachments = await inspectionsService.getInspectionAttachments(id);

      res.json({
        success: true,
        data: attachments,
      });
    } catch (error) {
      console.error("Error in getInspectionAttachments controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get inspection attachments",
      });
    }
  },
};

module.exports = inspectionsController;
