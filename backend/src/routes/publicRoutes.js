// ./src/routes/publicRoutes.js

const express = require("express");
const router = express.Router();
const checklistController = require("../controllers/checklistController");
const safetychecklistController = require("../controllers/safetychecklistController");
const inspectionsController = require("../controllers/inspectionsController");
const safetyinspectionsController = require("../controllers/safetyinspectionsController");
const MachinesController = require("../controllers/machinesController");
const logdailyMachinesController = require("../controllers/logdailyMachineController");
const logSafetyController = require("../controllers/logSafetyController");
const machineModelsController = require("../controllers/machineModelsController");
const LogParametersController = require("../controllers/LogParametersController");
const logdailyMachineController = require("../controllers/logdailyMachineController");

// Parameter and component quality
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const ParameterController = require("../controllers/ParameterController");
const QualityItemsController = require("../controllers/QualityItemsController");

// เพิ่ม Quality Inspection Controller
const LogQualityController = require("../controllers/LogQualityController");

// debug middleware for public routes
router.use((req, res, next) => {
  console.log("\n=== Public Route Debug ===");
  console.log("Path:", req.path);
  console.log("Method:", req.method);
  console.log("Body:", req.body);
  console.log("Query:", req.query);
  next();
});

// Checklist items routes
router.get("/checklist/items", checklistController.getPublicChecklistByParams);

// Checklist safety items routes
router.get(
  "/safetychecklist/items",
  safetychecklistController.getPublicChecklistByParams
);

// Check if this machine has already been inspected.
router.get(
  "/daily-machine-logs/check",
  logdailyMachinesController.checkDailyMachineLog
);

router.get("/safety-logs/check", logSafetyController.checkDailyMachineLog);

// safety-checklist routes
router.get(
  "/daily-safety-logs",
  safetyinspectionsController.checkDailySafetyLog
);

// Safety Inspection public routes
router.get(
  "/safety-inspections",
  safetyinspectionsController.getAllInspections
);
router.post(
  "/safety-inspections",
  safetyinspectionsController.createInspection
);
router.post(
  "/safety-inspections/attachments",
  safetyinspectionsController.createInspectionAttachments
);

router.get(
  "/safety-inspections/machine/:machine_name",
  safetyinspectionsController.getInspectionsByMachine
);
router.get(
  "/safety-inspections/status/:status",
  safetyinspectionsController.getInspectionsByStatus
);

// Inspection routes
router.get(
  "/inspections/machine/:machine_id",
  inspectionsController.getInspectionsByMachine
);
router.get(
  "/inspections/status/:status",
  inspectionsController.getInspectionsByStatus
);
router.get("/inspections", inspectionsController.getAllInspections);
router.post("/inspections", inspectionsController.createInspection);

router.get(
  "/inspections/history/by-id/:id",
  logdailyMachineController.getInspectionHistoryById
);

router.get(
  "/inspections/history/latest",
  logdailyMachineController.getLatestInspectionHistory
);

router.post(
  "/inspections/attachments",
  inspectionsController.createInspectionAttachments
);
router.get("/inspections/:id", inspectionsController.getInspectionById);
router.get(
  "/safety-inspections/:id",
  safetyinspectionsController.getInspectionById
);

// function getInspectionAttachments
router.get(
  "/inspections/:id/attachments",
  inspectionsController.getInspectionAttachments
);

router.get(
  "/safety-inspections/:id/attachments",
  safetyinspectionsController.getInspectionAttachments
);

// Machine routes
router.get("/findmachine", MachinesController.findMachine);

// Daily Machine Logs routes
router.get(
  "/daily-machine-logs",
  logdailyMachinesController.getPublicDailyMachineLogs
);

router.post(
  "/daily-machine-logs",
  logdailyMachinesController.createDailyMachineLog
);
router.get(
  "/daily-machine-logs/:id",
  logdailyMachinesController.getPublicDailyMachineLogById
);

// Safety Logs routes
router.get("/safety-logs", logSafetyController.getPublicDailyMachineLogs);
router.post("/safety-logs", logSafetyController.createDailyMachineLog);
router.get(
  "/safety-logs/:id",
  logSafetyController.getPublicDailyMachineLogById
);

// Parameter routes
router.get("/parameterlist/items", ParameterController.getParameterItems);
router.post(
  "/parameter-inspection",
  ParameterController.saveParameterInspection
);
router.post(
  "/parameter-inspection/attachments",
  ParameterController.saveParameterAttachments
);
router.get(
  "/parameter-inspection/check",
  ParameterController.checkParameterInspectionExists
);
router.post(
  "/parameter-inspection/upload",
  upload.single("file"),
  ParameterController.uploadFile
);

// Quality routes
router.get("/quality/items", QualityItemsController.getQualityItems);
router.post(
  "/quality-inspection",
  QualityItemsController.saveQualityInspection
);
router.post(
  "/quality-inspection/attachments",
  QualityItemsController.saveQualityAttachments
);
router.get(
  "/quality-inspection/check",
  QualityItemsController.checkQualityInspectionExists
);
router.post(
  "/quality-inspection/upload",
  upload.single("file"),
  QualityItemsController.uploadFile
);
router.get(
  "/quality-inspection/image/:imageUrl",
  QualityItemsController.getReferenceImage
);
router.get(
  "/spec-options",
  QualityItemsController.getSpecOptions
);

router.get(
  "/find-model-id",
  machineModelsController.findMachineModelIdController
);
router.get(
  "/program-names",
  machineModelsController.getProgramNamesByModelIdController
);

// ========= Parameter Inspection Routes (LogParametersController) =========
// New Path for Parameter Inspection Application
router.get(
  "/simple-parameter-items",
  LogParametersController.getSimpleParameterItems
);
router.get(
  "/parameter-inspections/:id/results",
  LogParametersController.getInspectionResults
);
router.get(
  "/parameter-inspections",
  LogParametersController.getPublicDailyMachineLogs
);
router.get(
  "/parameter-inspections/:id",
  LogParametersController.getPublicDailyMachineLogById
);
router.get(
  "/parameter-inspections/:id/attachments",
  LogParametersController.getInspectionAttachments
);
router.get("/parameter-list/items", LogParametersController.getParameterItems);
router.post(
  "/parameter-inspection/results",
  ParameterController.saveParameterInspectionResults
);
router.get(
  "/parameter-inspection/:inspectionId/results",
  ParameterController.getParameterInspectionResults
);

// Legacy Path for System Compatibility
router.get(
  "/daily-machine-logs",
  LogParametersController.getPublicDailyMachineLogs
);
router.get(
  "/daily-machine-logs/:id",
  LogParametersController.getPublicDailyMachineLogById
);
router.get("/checklist/items", LogParametersController.getParameterItems);

// Attachment routes
router.post("/attachments", LogParametersController.createAttachment);
router.put(
  "/daily-machine-logs/:id",
  LogParametersController.updateDailyMachineLog
);
router.delete(
  "/daily-machine-logs/:id",
  LogParametersController.deleteDailyMachineLog
);
router.get(
  "/daily-machine-logs/check",
  LogParametersController.checkDailyMachineLog
);

// ========= Quality Inspection Routes (LogQualityController) =========
// Data Retrieval Path for Quality Inspection
router.get(
  "/quality-inspections",
  LogQualityController.getPublicQualityInspections
);
router.get(
  "/quality-inspections/:id",
  LogQualityController.getPublicQualityInspectionById
);
router.get(
  "/quality-inspection-items",
  LogQualityController.getQualityInspectionItems
);
router.get(
  "/quality-inspection-measurements",
  LogQualityController.getQualityInspectionMeasurements
);

// New Path as Requested
router.get(
  "/quality-all-items",
  LogQualityController.getAllQualityInspectionItems
);
router.get(
  "/quality-all-measurements",
  LogQualityController.getAllQualityInspectionMeasurements
);
router.get(
  "/quality-complete/:id",
  LogQualityController.getCompleteQualityInspection
);

// Path for Retrieving Machine Data and Model: quality-machine-logs
router.get("/quality-machine-logs", LogQualityController.getMachines);
router.get(
  "/quality-machine-models-logs",
  LogQualityController.getMachineModels
);

// Path for Creating and Verifying Quality Inspection
router.post(
  "/quality/inspections",
  LogQualityController.createQualityInspection
);
router.post(
  "/quality/inspection-items",
  LogQualityController.createQualityInspectionItem
);
router.post(
  "/quality/inspection-measurements",
  LogQualityController.createQualityInspectionMeasurement
);
router.post(
  "/quality/complete-measurements",
  LogQualityController.saveCompleteMeasurements
);
router.get(
  "/quality-inspection/check",
  LogQualityController.checkExistingInspection
);

// Path for Updating and Deleting Quality Inspection
router.put(
  "/quality/inspections/:id",
  LogQualityController.updateQualityInspection
);
router.delete(
  "/quality/inspections/:id",
  LogQualityController.deleteQualityInspection
);

module.exports = router;
