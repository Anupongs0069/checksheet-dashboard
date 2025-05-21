// src/routes/parameterRoutes.js
const express = require("express");
const router = express.Router();
const parameterInspectionController = require("../controllers/parameterInspectionController");

/**
 * ดึงข้อมูลรายละเอียดการตรวจเช็คพารามิเตอร์
 * @route GET /api/parameter-inspection
 * @query {number} [inspection_id] - ID ของการตรวจสอบที่ต้องการ (ถ้าไม่ระบุจะดึงทั้งหมด)
 * @access Public
 */
router.get("/", parameterInspectionController.getParameterInspectionDetails);

/**
 * ดึงข้อมูลผลการตรวจวัดพารามิเตอร์
 * @route GET /api/parameter-inspection/results
 * @query {number} inspection_id - ID ของการตรวจสอบที่ต้องการ
 * @access Public
 */
router.get("/results", parameterInspectionController.getParameterResults);

module.exports = router;