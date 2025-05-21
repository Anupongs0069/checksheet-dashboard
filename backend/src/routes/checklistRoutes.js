// src/routes/checklistRoutes.js

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
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

  // Checklist Query
  getChecklistByParams,
} = require("../controllers/checklistController");

// Protected Checklist Routes
router.get("/items", authenticateToken, getChecklistByParams);

// Checklist Groups Routes
router.get("/groups", authenticateToken, getAllChecklistGroups);
router.get("/groups/:id", authenticateToken, getChecklistGroupById);
router.post("/groups", authenticateToken, createChecklistGroup);
router.put("/groups/:id", authenticateToken, updateChecklistGroup);
router.delete("/groups/:id", authenticateToken, deleteChecklistGroup);

// Model Checklist Items Routes
router.get("/items", authenticateToken, getAllModelChecklistItems);
router.get("/items/:id", authenticateToken, getModelChecklistItemById);
router.post("/items", authenticateToken, createModelChecklistItem);
router.put("/items/:id", authenticateToken, updateModelChecklistItem);
router.delete("/items/:id", authenticateToken, deleteModelChecklistItem);

// Inspection History Routes
router.post("/inspection", authenticateToken, createInspectionHistory);
router.get("/inspection", authenticateToken, getInspectionHistory);

module.exports = router;
