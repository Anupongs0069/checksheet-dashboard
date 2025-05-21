// ./src/routes/statusMachineRoutes.js

const express = require('express');
const router = express.Router();
const StatusMachineController = require('../controllers/StatusMachineController');

// Debug middleware
router.use((req, res, next) => {
  console.log("\n=== Status Machine Route Debug ===");
  console.log("Path:", req.path);
  console.log("Base URL:", req.baseUrl);
  next();
});

// Endpoints สำหรับข้อมูลเครื่องจักร
router.get('/all', StatusMachineController.getAllMachines);
router.get('/:id', StatusMachineController.getMachineById);
router.put('/:id/status', StatusMachineController.updateMachineStatus);

// Endpoints สำหรับข้อมูล Downtime
router.get('/downtime', StatusMachineController.getDowntimeRecords);
router.post('/downtime', StatusMachineController.createDowntimeRecord);
router.put('/downtime/:id', StatusMachineController.updateDowntimeRecord);

// Endpoints สำหรับสรุปข้อมูล Dashboard
router.get('/dashboard/summary', StatusMachineController.getDashboardSummary);
router.get('/dashboard/by-reason', StatusMachineController.getDowntimeByReason);
router.get('/dashboard/time-series', StatusMachineController.getDowntimeTimeSeries);
router.get('/dashboard/status-machine', StatusMachineController.getStatusMachine);

// Endpoints สำหรับสถิติการวิเคราะห์
router.get('/stats/by-machine', StatusMachineController.getDowntimeStatsByMachine);
router.get('/stats/top-reasons', StatusMachineController.getTopDowntimeReasons);

module.exports = router;