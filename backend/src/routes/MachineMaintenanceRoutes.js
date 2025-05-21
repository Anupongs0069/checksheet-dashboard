// ./src/routes/MachineMaintenanceRoutes.js
const express = require("express");
const router = express.Router();
const { getLatestMachineInfo } = require("../controllers/MachineMaintenanceController");

router.get("/:machineId", getLatestMachineInfo);

module.exports = router;