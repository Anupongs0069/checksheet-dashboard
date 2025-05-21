// src/routes/safetyinspectionsRoutes.js
const express = require("express");
const router = express.Router();
const safetyinspectionsController = require("../controllers/safetyinspectionsController");

// Debug: ตรวจสอบ controller ที่ import มา
console.log("Imported safetyinspections controller:", {
  createInspection: !!safetyinspectionsController.createInspection,
  updateStatus: !!safetyinspectionsController.updateStatus,
  deleteInspection: !!safetyinspectionsController.deleteInspection,
});

// Safety Inspection routes
router.get("/", safetyinspectionsController.getAllInspections);
router.get("/:id", safetyinspectionsController.getInspectionById);
router.get("/machine/:machine_name", safetyinspectionsController.getInspectionsByMachine);
router.get("/status/:status", safetyinspectionsController.getInspectionsByStatus);

// การตรวจสอบว่า function มีอยู่จริงก่อนกำหนด route
if (typeof safetyinspectionsController.createInspection === "function") {
  router.post("/", safetyinspectionsController.createInspection);
} else {
  console.error("createInspection function is not defined in controller");
}

if (typeof safetyinspectionsController.createInspectionAttachments === "function") {
  router.post("/attachments", safetyinspectionsController.createInspectionAttachments);
} else {
  console.error("createInspectionAttachments function is not defined in controller");
}

if (typeof safetyinspectionsController.updateStatus === "function") {
  router.put("/status/:id", safetyinspectionsController.updateStatus);
} else {
  console.error("updateStatus function is not defined in controller");
}

if (typeof safetyinspectionsController.deleteInspection === "function") {
  router.delete("/:id", safetyinspectionsController.deleteInspection);
} else {
  console.error("deleteInspection function is not defined in controller");
}

router.get("/history", safetyinspectionsController.getInspectionHistory);

module.exports = router;