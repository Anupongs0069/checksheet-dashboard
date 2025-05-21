// src/routes/logdailyMachineRoutes.js

const express = require("express");
const router = express.Router();
const logdailyMachineController = require("../controllers/logdailyMachineController");

// debug middleware
router.use((req, res, next) => {
  console.log("\n=== LogDaily Machine Route Debug ===");
  console.log("Path:", req.path);
  console.log("Method:", req.method);
  console.log("Body:", req.body);
  console.log("Query:", req.query);
  next();
});

// Protected routes สำหรับ authenticated users
router.put("/:id", logdailyMachineController.updateDailyMachineLog);
router.delete("/:id", logdailyMachineController.deleteDailyMachineLog);

module.exports = router;