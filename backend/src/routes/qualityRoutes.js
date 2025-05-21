// ./src/routes/qualityRoutes.js
const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/qualityController');
const imageController = require('../controllers/imageController');

// API Routes
router.get('/quality-items', qualityController.getQualityItems);
router.post('/quality-inspections', qualityController.saveQualityInspection);
router.post('/quality-attachments', qualityController.saveQualityAttachments);
router.get('/quality-inspections/check', qualityController.checkQualityInspectionExists);

// ใช้ middleware การอัปโหลดจาก imageController
router.post('/measurements', qualityController.saveQualityMeasurement);
router.post('/measurement-points', qualityController.saveMeasurementPoint);
router.post('/measurement-attachments', imageController.uploadFile, qualityController.saveMeasurementAttachment);
router.get('/measurements/:id', qualityController.getQualityMeasurement);
router.get('/measurements/machine/:machineId', qualityController.getQualityMeasurementsByMachine);
router.post('/complete-measurements', imageController.uploadFiles, qualityController.saveCompleteMeasurement);

module.exports = router;