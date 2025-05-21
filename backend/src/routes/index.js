// ./src/routes/index.js

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use((req, res, next) => {
  console.log("\n=== Index Route Debug ===");
  console.log("Path:", req.path);
  console.log("Base URL:", req.baseUrl);
  next();
});

// Import routes
const loginUserController = require("../controllers/loginUserController");
const machinesRoutes = require("./machineRoutes");
const checklistRoutes = require("./checklistRoutes");
const publicRoutes = require("./publicRoutes");
const inspectionsRoutes = require("./inspectionsRoutes");
const logdailyMachineRoutes = require("./logdailyMachineRoutes"); 
const safetyinspectionsRoutes = require("./safetyinspectionsRoutes");
const userManagementRoutes = require("./usermanagementRoutes");
const imageController = require('../controllers/imageController');
const qualityRoutes = require("./qualityRoutes");
const parameterRoutes = require("./parameterRoutes");
const downtimeRoutes = require("./downtimeRoutes");
const statusMachineRoutes = require("./StatusMachineRoutes");
const MachineMaintenanceRoutes = require("./MachineMaintenanceRoutes");


// Routes configuration
router.use("/public", publicRoutes);
router.use("/login-user", loginUserController.login);
router.use("/machines",  machinesRoutes);
router.use('/quality', qualityRoutes);
router.use("/checklist", authenticateToken, checklistRoutes);
router.use("/inspections", authenticateToken, inspectionsRoutes);
router.use("/daily-machine-logs", authenticateToken, logdailyMachineRoutes); 
router.use("/safety-inspections", authenticateToken, safetyinspectionsRoutes);
router.use("/user-management", authenticateToken, userManagementRoutes); 

router.get('/images/:imagePath(*)', imageController.getImage);
router.get('/reference-images/:imageUrl', imageController.getReferenceImage);
router.post('/upload/single', imageController.uploadFile);
router.post('/upload/multiple', imageController.uploadFiles);
router.use("/parameter-inspection", parameterRoutes);
router.use("/downtime", downtimeRoutes);
router.use("/status-machine", statusMachineRoutes);
router.use("/machine-maintenance", MachineMaintenanceRoutes);


module.exports = router;