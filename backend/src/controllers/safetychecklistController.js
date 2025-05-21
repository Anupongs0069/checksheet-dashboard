// src/controllers/safetychecklistController.js

const safetychecklistService = require("../services/safetychecklistService");

// SafetyChecklist Groups Controllers
const getAllChecklistGroups = async (req, res) => {
  try {
    const groups = await safetychecklistService.getAllChecklistGroups();
    res.status(200).json({
      message: "SafetyChecklist groups retrieved successfully",
      groups: groups,
    });
  } catch (error) {
    console.error("Error getting safetychecklist groups:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getChecklistGroupById = async (req, res) => {
  try {
    const group = await safetychecklistService.getChecklistGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "SafetyChecklist group not found" });
    }
    res.status(200).json({
      message: "SafetyChecklist group retrieved successfully",
      group: group,
    });
  } catch (error) {
    console.error("Error getting safetychecklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const createChecklistGroup = async (req, res) => {
  try {
    const newGroup = await safetychecklistService.createChecklistGroup(req.body);
    res.status(201).json({
      message: "SafetyChecklist group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("Error creating safetychecklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const updateChecklistGroup = async (req, res) => {
  try {
    const updatedGroup = await safetychecklistService.updateChecklistGroup(
      req.params.id,
      req.body
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: "SafetyChecklist group not found" });
    }
    res.status(200).json({
      message: "SafetyChecklist group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Error updating safetychecklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const deleteChecklistGroup = async (req, res) => {
  try {
    const deletedGroup = await safetychecklistService.deleteChecklistGroup(
      req.params.id
    );
    if (!deletedGroup) {
      return res.status(404).json({ message: "SafetyChecklist group not found" });
    }
    res.status(200).json({
      message: "SafetyChecklist group deleted successfully",
      group: deletedGroup,
    });
  } catch (error) {
    console.error("Error deleting safetychecklist group:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Model SafetyChecklist Items Controllers
const getAllModelChecklistItems = async (req, res) => {
  try {
    const items = await safetychecklistService.getAllModelChecklistItems();
    res.status(200).json({
      message: "Model safetychecklist items retrieved successfully",
      items: items,
    });
  } catch (error) {
    console.error("Error getting model safetychecklist items:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getModelChecklistItemById = async (req, res) => {
  try {
    const item = await safetychecklistService.getModelChecklistItemById(
      req.params.id
    );
    if (!item) {
      return res
        .status(404)
        .json({ message: "Model safetychecklist item not found" });
    }
    res.status(200).json({
      message: "Model safetychecklist item retrieved successfully",
      item: item,
    });
  } catch (error) {
    console.error("Error getting model safetychecklist item:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const createModelChecklistItem = async (req, res) => {
  try {
    const newItem = await safetychecklistService.createModelChecklistItem(req.body);
    res.status(201).json({
      message: "Model safetychecklist item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error creating model safetychecklist item:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const updateModelChecklistItem = async (req, res) => {
  try {
    const updatedItem = await safetychecklistService.updateModelChecklistItem(
      req.params.id,
      req.body
    );
    if (!updatedItem) {
      return res
        .status(404)
        .json({ message: "Model safetychecklist item not found" });
    }
    res.status(200).json({
      message: "Model safetychecklist item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating model safetychecklist item:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const deleteModelChecklistItem = async (req, res) => {
  try {
    const deletedItem = await safetychecklistService.deleteModelChecklistItem(
      req.params.id
    );
    if (!deletedItem) {
      return res
        .status(404)
        .json({ message: "Model safetychecklist item not found" });
    }
    res.status(200).json({
      message: "Model safetychecklist item deleted successfully",
      item: deletedItem,
    });
  } catch (error) {
    console.error("Error deleting model safetychecklist item:", error);
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
    const newInspection = await safetychecklistService.createInspectionHistory(
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

    const history = await safetychecklistService.getInspectionHistory(filters);
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

// Protected safetychecklist query
const getChecklistByParams = async (req, res) => {
  try {
    const { machineName, model } = req.query;
    console.log("Received Parameters:", req.query);

    if (!machineName || !model) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
        received: { machineName, model },
      });
    }

    const result = await safetychecklistService.getChecklistByFrequencyConditions(
      machineName,
      model
    );

    if (!result.total) {
      return res.status(404).json({
        success: false,
        message: "No safetychecklist items found with given parameters",
        parameters: { machineName, model },
      });
    }

    res.status(200).json({
      success: true,
      message: "SafetyChecklist retrieved successfully",
      total: result.total,
      groups: result.groups,
    });
  } catch (error) {
    console.error("Error getting safetychecklist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch safetychecklist",
      error: error.message,
    });
  }
};

// Public safetychecklist query
const getPublicChecklistByParams = async (req, res) => {
  try {
    const { machineName, model } = req.query;
    console.log("Received Public Parameters:", req.query);

    if (!machineName || !model) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
        received: { machineName, model },
      });
    }

    const result = await safetychecklistService.getChecklistByFrequencyConditions(
      machineName,
      model
    );

    if (!result.total) {
      return res.status(404).json({
        success: false,
        message: "No safetychecklist items found with given parameters",
        parameters: { machineName, model },
      });
    }

    res.status(200).json({
      success: true,
      message: "SafetyChecklist retrieved successfully",
      total: result.total,
      groups: result.groups,
    });
  } catch (error) {
    console.error("Error getting public safetychecklist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch safetychecklist",
      error: error.message,
    });
  }
};

module.exports = {
  // SafetyChecklist Groups
  getAllChecklistGroups,
  getChecklistGroupById,
  createChecklistGroup,
  updateChecklistGroup,
  deleteChecklistGroup,

  // Model SafetyChecklist Items
  getAllModelChecklistItems,
  getModelChecklistItemById,
  createModelChecklistItem,
  updateModelChecklistItem,
  deleteModelChecklistItem,

  // Inspection History
  createInspectionHistory,
  getInspectionHistory,

  // SafetyChecklist Queries
  getChecklistByParams,
  getPublicChecklistByParams,
};
