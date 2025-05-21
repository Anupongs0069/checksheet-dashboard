// ./src/controllers/LogQualityController.js

const LogQualityService = require("../services/LogQualityService");

const LogQualityController = {
  // Public Methods

async getPublicQualityInspections(req, res) {
  try {
    const { employee_id, work_order, machine_id, startDate, endDate, today } = req.query;

    console.log("Request parameters:", {
      employee_id,
      work_order,
      machine_id,
      startDate,
      endDate,
      today,
    });

    const inspections = await LogQualityService.getPublicInspections({
      employee_id,
      work_order,
      machine_id,
      startDate,
      endDate,
      today: today === 'true',
    });

    res.json(inspections);
  } catch (error) {
    console.error("Error in getPublicQualityInspections:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
},

  async getPublicQualityInspectionById(req, res) {
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
      const inspection = await LogQualityService.getPublicInspectionById(
        numericId
      );

      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }

      res.json(inspection);
    } catch (error) {
      console.error("Error in getPublicQualityInspectionById:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getQualityInspectionItems(req, res) {
    try {
      const { inspection_id } = req.query;

      if (!inspection_id || isNaN(parseInt(inspection_id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid inspection ID format: ID must be a number",
        });
      }

      const items = await LogQualityService.getInspectionItems(
        parseInt(inspection_id)
      );
      res.json(items);
    } catch (error) {
      console.error("Error in getQualityInspectionItems:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getQualityInspectionMeasurements(req, res) {
    try {
      const { inspection_item_id } = req.query;

      if (!inspection_item_id || isNaN(parseInt(inspection_item_id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid inspection item ID format: ID must be a number",
        });
      }

      const measurements = await LogQualityService.getInspectionMeasurements(
        parseInt(inspection_item_id)
      );
      res.json(measurements);
    } catch (error) {
      console.error("Error in getQualityInspectionMeasurements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getMachines(req, res) {
    try {
      const machines = await LogQualityService.getMachines();
      res.json(machines);
    } catch (error) {
      console.error("Error in getMachines:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getMachineModels(req, res) {
    try {
      const models = await LogQualityService.getMachineModels();
      res.json(models);
    } catch (error) {
      console.error("Error in getMachineModels:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async createQualityInspection(req, res) {
    try {
      const newInspection = await LogQualityService.createInspection(req.body);
      res.status(201).json(newInspection);
    } catch (error) {
      console.error("Error in createQualityInspection:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async createQualityInspectionItem(req, res) {
    try {
      const newItem = await LogQualityService.createInspectionItem(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error in createQualityInspectionItem:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async createQualityInspectionMeasurement(req, res) {
    try {
      const newMeasurement =
        await LogQualityService.createInspectionMeasurement(req.body);
      res.status(201).json(newMeasurement);
    } catch (error) {
      console.error("Error in createQualityInspectionMeasurement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async saveCompleteMeasurements(req, res) {
    try {
      const { measurementData, points } = req.body;
      const result = await LogQualityService.saveCompleteMeasurements(
        measurementData,
        points
      );
      res.status(201).json({
        success: true,
        message: "Quality measurement data saved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in saveCompleteMeasurements:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save quality measurements",
        error: error.message,
      });
    }
  },

  // Protected Methods
  async updateQualityInspection(req, res) {
    try {
      const { id } = req.params;
      const updatedInspection = await LogQualityService.updateInspection(
        id,
        req.body
      );
      if (!updatedInspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(updatedInspection);
    } catch (error) {
      console.error("Error in updateQualityInspection:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async deleteQualityInspection(req, res) {
    try {
      const { id } = req.params;
      const result = await LogQualityService.deleteInspection(id);
      if (!result) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error in deleteQualityInspection:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async checkExistingInspection(req, res) {
    try {
      const { machine_id, date, shift, work_order } = req.query;

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

      const exists = await LogQualityService.checkInspectionExists(
        parseInt(machine_id),
        date,
        shift,
        work_order
      );

      return res.status(200).json({
        success: true,
        exists: exists,
      });
    } catch (error) {
      console.error("Error checking inspection existence:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check inspection status",
      });
    }
  },


  // Method to Retrieve All Data from quality_inspection_items
async getAllQualityInspectionItems(req, res) {
  try {
    const { 
      inspection_id, 
      quality_item_id,
      startDate,
      endDate,
      today
    } = req.query;
    
    console.log("Query:", req.query);
    
    const filters = {};
    
    if (inspection_id) filters.inspection_id = inspection_id;
    if (quality_item_id) filters.quality_item_id = quality_item_id;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (today === 'true') filters.today = true;
    
    const items = await LogQualityService.getAllInspectionItems(filters);
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error("Error in getAllQualityInspectionItems:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve quality inspection items",
      error: error.message
    });
  }
},

  // Method to Retrieve All Data from quality_inspection_measurements
async getAllQualityInspectionMeasurements(req, res) {
  try {
    const { 
      inspection_item_id, 
      point_number, 
      status,
      startDate,
      endDate,
      today
    } = req.query;
    
    console.log("Query:", req.query);
    
    const filters = {};
    
    if (inspection_item_id) filters.inspection_item_id = inspection_item_id;
    if (point_number) filters.point_number = point_number;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (today === 'true') filters.today = true;
    
    const measurements = await LogQualityService.getAllInspectionMeasurements(filters);
    
    res.json({
      success: true,
      count: measurements.length,
      data: measurements
    });
  } catch (error) {
    console.error("Error in getAllQualityInspectionMeasurements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve quality inspection measurements",
      error: error.message
    });
  }
},

  // Method to Retrieve All Combined Data of Quality Inspection
  async getCompleteQualityInspection(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid inspection ID: ID must be a number",
        });
      }

      const completeData = await LogQualityService.getCompleteInspectionData(
        parseInt(id)
      );

      if (!completeData) {
        return res.status(404).json({
          success: false,
          message: "Inspection not found",
        });
      }

      res.json({
        success: true,
        data: completeData,
      });
    } catch (error) {
      console.error("Error in getCompleteQualityInspection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve complete quality inspection data",
        error: error.message,
      });
    }
  },
};

module.exports = LogQualityController;
