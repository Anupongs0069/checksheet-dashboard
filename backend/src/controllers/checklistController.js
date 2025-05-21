// src/controllers/checklistController.js

const checklistService = require("../services/checklistService");

// Checklist Groups Controllers
const getAllChecklistGroups = async (req, res) => {
  try {
    const groups = await checklistService.getAllChecklistGroups();
    res.status(200).json({
      message: "Checklist groups retrieved successfully",
      groups: groups,
    });
  } catch (error) {
    console.error("Error getting checklist groups:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getChecklistGroupById = async (req, res) => {
  try {
    const group = await checklistService.getChecklistGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Checklist group not found" });
    }
    res.status(200).json({
      message: "Checklist group retrieved successfully",
      group: group,
    });
  } catch (error) {
    console.error("Error getting checklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const createChecklistGroup = async (req, res) => {
  try {
    const newGroup = await checklistService.createChecklistGroup(req.body);
    res.status(201).json({
      message: "Checklist group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("Error creating checklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const updateChecklistGroup = async (req, res) => {
  try {
    const updatedGroup = await checklistService.updateChecklistGroup(
      req.params.id,
      req.body
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: "Checklist group not found" });
    }
    res.status(200).json({
      message: "Checklist group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Error updating checklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const deleteChecklistGroup = async (req, res) => {
  try {
    const deletedGroup = await checklistService.deleteChecklistGroup(
      req.params.id
    );
    if (!deletedGroup) {
      return res.status(404).json({ message: "Checklist group not found" });
    }
    res.status(200).json({
      message: "Checklist group deleted successfully",
      group: deletedGroup,
    });
  } catch (error) {
    console.error("Error deleting checklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Model Checklist Items Controllers
const getAllModelChecklistItems = async (req, res) => {
  try {
    const items = await checklistService.getAllModelChecklistItems();
    res.status(200).json({
      message: "Model checklist items retrieved successfully",
      items: items,
    });
  } catch (error) {
    console.error("Error getting model checklist items:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getModelChecklistItemById = async (req, res) => {
  try {
    const item = await checklistService.getModelChecklistItemById(
      req.params.id
    );
    if (!item) {
      return res
        .status(404)
        .json({ message: "Model checklist item not found" });
    }
    res.status(200).json({
      message: "Model checklist item retrieved successfully",
      item: item,
    });
  } catch (error) {
    console.error("Error getting model checklist item:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const createModelChecklistItem = async (req, res) => {
  try {
    const newItem = await checklistService.createModelChecklistItem(req.body);
    res.status(201).json({
      message: "Model checklist item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error creating model checklist item:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const updateModelChecklistItem = async (req, res) => {
  try {
    const updatedItem = await checklistService.updateModelChecklistItem(
      req.params.id,
      req.body
    );
    if (!updatedItem) {
      return res
        .status(404)
        .json({ message: "Model checklist item not found" });
    }
    res.status(200).json({
      message: "Model checklist item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating model checklist item:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const deleteModelChecklistItem = async (req, res) => {
  try {
    const deletedItem = await checklistService.deleteModelChecklistItem(
      req.params.id
    );
    if (!deletedItem) {
      return res
        .status(404)
        .json({ message: "Model checklist item not found" });
    }
    res.status(200).json({
      message: "Model checklist item deleted successfully",
      item: deletedItem,
    });
  } catch (error) {
    console.error("Error deleting model checklist item:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Inspection History Controllers
const createInspectionHistory = async (req, res) => {
  try {
    const newInspection = await checklistService.createInspectionHistory(
      req.body
    );
    res.status(201).json({
      message: "Inspection history created successfully",
      inspection: newInspection,
    });
  } catch (error) {
    console.error("Error creating inspection history:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getInspectionHistory = async (req, res) => {
  try {
    const filters = {
      machine_id: req.query.machine_id,
      user_id: req.query.user_id,
      status: req.query.status,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const history = await checklistService.getInspectionHistory(filters);
    res.status(200).json({
      message: "Inspection history retrieved successfully",
      history: history,
    });
  } catch (error) {
    console.error("Error getting inspection history:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Protected checklist query
const getChecklistByParams = async (req, res) => {
  try {
    const { 
      machineName, 
      model, 
      is_daily, 
      is_weekly, 
      is_monthly, 
      is_quarterly, 
      is_6_months, 
      is_yearly 
    } = req.query;
    console.log("Received Parameters:", req.query);

    if (!machineName || !model) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
        received: { machineName, model },
      });
    }

    // ส่งค่า flags ต่างๆ ไปด้วย
    const result = await checklistService.getChecklistByFrequency(
      machineName,
      model,
      { is_daily, is_weekly, is_monthly, is_quarterly, is_6_months, is_yearly }
    );

    if (!result.total) {
      return res.status(404).json({
        success: false,
        message: "No checklist items found with given parameters",
        parameters: { machineName, model },
      });
    }

    res.status(200).json({
      success: true,
      message: "Checklist retrieved successfully",
      total: result.total,
      groups: result.groups,
    });
  } catch (error) {
    console.error("Error getting checklist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch checklist",
      error: error.message,
    });
  }
};

// Public checklist query
const getPublicChecklistByParams = async (req, res) => {
  try {
    const { 
      machineName, 
      model, 
      is_daily, 
      is_weekly, 
      is_monthly, 
      is_quarterly, 
      is_6_months, 
      is_yearly 
    } = req.query;
    console.log("Received Public Parameters:", req.query);

    if (!machineName || !model) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
        received: { machineName, model },
      });
    }

    // ส่งค่า flags ต่างๆ ไปด้วย
    const result = await checklistService.getChecklistByFrequency(
      machineName,
      model,
      { is_daily, is_weekly, is_monthly, is_quarterly, is_6_months, is_yearly }
    );

    if (!result.total) {
      return res.status(404).json({
        success: false,
        message: "No checklist items found with given parameters",
        parameters: { machineName, model },
      });
    }

    res.status(200).json({
      success: true,
      message: "Checklist retrieved successfully",
      total: result.total,
      groups: result.groups,
    });
  } catch (error) {
    console.error("Error getting public checklist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch checklist",
      error: error.message,
    });
  }
};

module.exports = {
  // Checklist Groups
  getAllChecklistGroups,
  getChecklistGroupById,
  createChecklistGroup,
  updateChecklistGroup,
  deleteChecklistGroup,

  // Model Checklist Items
  getAllModelChecklistItems,
  getModelChecklistItemById,
  createModelChecklistItem,
  updateModelChecklistItem,
  deleteModelChecklistItem,

  // Inspection History
  createInspectionHistory,
  getInspectionHistory,

  // Checklist Queries
  getChecklistByParams,
  getPublicChecklistByParams,
};
