// src/routes/inspectionsRoutes.js
const express = require("express");
const router = express.Router();
const inspectionsController = require("../controllers/inspectionsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Debug: ตรวจสอบ controller ที่ import มา
console.log("Imported inspections controller:", {
  createInspection: !!inspectionsController.createInspection,
  updateStatus: !!inspectionsController.updateStatus,
  deleteInspection: !!inspectionsController.deleteInspection,
});

// ทุก route ต้องผ่าน authentication
router.use(authenticateToken);

// Protected Routes
router.get("/", inspectionsController.getAllInspections);
router.get("/:id", inspectionsController.getInspectionById);
router.get(
  "/machine/:machine_id",
  inspectionsController.getInspectionsByMachine
);
router.get("/status/:status", inspectionsController.getInspectionsByStatus);

// การตรวจสอบว่า function มีอยู่จริงก่อนกำหนด route
if (typeof inspectionsController.createInspection === "function") {
  router.post("/", inspectionsController.createInspection);
} else {
  console.error("createInspection function is not defined in controller");
}

if (typeof inspectionsController.updateStatus === "function") {
  router.patch("/:id/status", inspectionsController.updateStatus);
} else {
  console.error("updateStatus function is not defined in controller");
}

if (typeof inspectionsController.deleteInspection === "function") {
  router.delete("/:id", inspectionsController.deleteInspection);
} else {
  console.error("deleteInspection function is not defined in controller");
}

module.exports = router;
