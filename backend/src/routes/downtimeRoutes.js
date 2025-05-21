// ./src/routes/downtimeRoutes.js

const express = require("express");
const router = express.Router();
const DowntimeController = require("../controllers/downtimeController");

// สาเหตุการหยุดทำงาน
router.post("/reasons", DowntimeController.createDowntimeReason);
router.get("/reasons", DowntimeController.getDowntimeReasons);

// สถิติและรายงาน
router.get("/stats/by-machine", DowntimeController.getDowntimeStatsByMachine);
router.get("/stats/top-reasons", DowntimeController.getTopDowntimeReasons);

// Dashboard API
router.get("/dashboard/summary", DowntimeController.getDashboardSummary);
router.get("/dashboard/time-series", DowntimeController.getDowntimeTimeSeries);
router.get("/dashboard/by-reason", DowntimeController.getDowntimeByReason);

// บันทึกและจัดการการหยุดทำงาน
router.post("/", DowntimeController.createDowntime);
router.put("/:id", DowntimeController.updateDowntime);
router.put("/:id/resolve", DowntimeController.resolveDowntime);
router.get("/:id", DowntimeController.getDowntimeById);
router.get("/", DowntimeController.getDowntimeList);

// การดำเนินการซ่อมบำรุง
router.post("/maintenance-actions", DowntimeController.addMaintenanceAction);
router.put("/machines/:id/status", DowntimeController.updateMachineStatus);

module.exports = router;
