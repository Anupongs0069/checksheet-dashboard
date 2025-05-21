// ./src/controllers/qualityController.js

const QualityItemsService = require("../services/QualityItemsService");
const QualityMeasurementService = require('../services/QualityMeasurementService');

// Get quality items for a machine model
const getQualityItems = async (req, res) => {
  try {
    console.log('Query parameters:', req.query);
    const { machineModelId, barCodeUnit, specLength } = req.query;
    
    if (!machineModelId) {
      return res.status(400).json({
        success: false,
        message: "Machine model ID is required"
      });
    }
    
    const result = await QualityItemsService.getQualityItems(
      machineModelId,
      barCodeUnit,
      specLength
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting quality items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get quality items",
      error: error.message
    });
  }
};

// Save quality inspection results
const saveQualityInspection = async (req, res) => {
  try {
    const result = await QualityItemsService.saveQualityInspection(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error saving quality inspection:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save quality inspection",
      error: error.message
    });
  }
};

// Save quality inspection attachments
const saveQualityAttachments = async (req, res) => {
  try {
    const result = await QualityItemsService.saveQualityAttachments(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error saving quality attachments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save quality attachments",
      error: error.message
    });
  }
};

// Check if quality inspection exists
const checkQualityInspectionExists = async (req, res) => {
  try {
    const { machine_id, date, shift, work_order } = req.query;
    const result = await QualityItemsService.checkQualityInspectionExists(
      machine_id, date, shift, work_order
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error checking quality inspection:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check quality inspection",
      error: error.message
    });
  }
};

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const { inspectionId } = req.body;
    const result = await QualityItemsService.saveFileToInspection(req.file, inspectionId);
    
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message
    });
  }
};

/** 
// Get reference image
const getReferenceImage = async (req, res) => {
  try {
    const { imageUrl } = req.params;
    const result = await QualityItemsService.getReferenceImage(imageUrl);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.set('Content-Type', result.data.contentType);
    return res.send(result.data.fileContent);
  } catch (error) {
    console.error("Error getting reference image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get reference image",
      error: error.message
    });
  }
};
**/

/**
 * Save a new quality measurement inspection
 */
const saveQualityMeasurement = async (req, res) => {
  try {
    const {
      machine_id,
      machine_model_id,
      quality_item_id,
      employee_id,
      lead_employee_id,
      work_order,
      barcode_unit,
      shift,
      standard_value,
      tolerance,
      unit,
      overall_result,
      remarks
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!machine_id || !machine_model_id || !quality_item_id || !employee_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const result = await QualityMeasurementService.saveQualityMeasurement({
      machine_id,
      machine_model_id,
      quality_item_id,
      employee_id,
      lead_employee_id,
      work_order,
      barcode_unit,
      shift,
      standard_value,
      tolerance,
      unit,
      overall_result,
      remarks
    });

    return res.status(201).json({
      success: true,
      message: "Quality measurement inspection saved successfully",
      data: {
        id: result.id
      }
    });
  } catch (error) {
    console.error("Error saving quality measurement:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save quality measurement inspection",
      error: error.message
    });
  }
};

/**
 * Save a measurement point for a quality inspection
 */
const saveMeasurementPoint = async (req, res) => {
  try {
    const {
      inspection_id,
      point_number,
      measured_value,
      status,
      issue_detail
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!inspection_id || !point_number || measured_value === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const result = await QualityMeasurementService.saveMeasurementPoint({
      inspection_id,
      point_number,
      measured_value,
      status,
      issue_detail
    });

    return res.status(201).json({
      success: true,
      message: "Measurement point saved successfully",
      data: {
        id: result.id
      }
    });
  } catch (error) {
    console.error("Error saving measurement point:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save measurement point",
      error: error.message
    });
  }
};

/**
 * Upload and save an attachment for a measurement point
 */
const saveMeasurementAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const measurement_point_id = req.body.measurement_point_id;
    
    if (!measurement_point_id) {
      return res.status(400).json({
        success: false,
        message: "Measurement point ID is required"
      });
    }

    const result = await QualityMeasurementService.saveMeasurementAttachment(
      { measurement_point_id },
      req.file
    );

    return res.status(201).json({
      success: true,
      message: "Attachment saved successfully",
      data: {
        id: result.id,
        file_path: result.file_path
      }
    });
  } catch (error) {
    console.error("Error saving measurement attachment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save attachment",
      error: error.message
    });
  }
};

/**
 * Get quality measurement by ID with all related points and attachments
 */
const getQualityMeasurement = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Measurement ID is required"
      });
    }
    
    const result = await QualityMeasurementService.getQualityMeasurementById(id);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error("Error getting quality measurement:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get quality measurement",
      error: error.message
    });
  }
};

/**
 * Get quality measurements for a machine
 */
const getQualityMeasurementsByMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "Machine ID is required"
      });
    }
    
    const result = await QualityMeasurementService.getQualityMeasurementsByMachine(
      machineId,
      limit,
      offset
    );
    
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error("Error getting quality measurements:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get quality measurements",
      error: error.message
    });
  }
};

/**
 * Save complete measurement in one transaction
 */
const saveCompleteMeasurement = async (req, res) => {
  try {
    const { 
      measurementData,
      points 
    } = req.body;
    
    // แปลง points จาก JSON string เป็น object ถ้าจำเป็น
    const pointsData = typeof points === 'string' ? JSON.parse(points) : points;
    const measurementDataObj = typeof measurementData === 'string' ? JSON.parse(measurementData) : measurementData;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!measurementDataObj || !pointsData || !Array.isArray(pointsData) || pointsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required measurement data or points"
      });
    }
    
    // ผสานข้อมูลจุดวัดเข้ากับข้อมูลหลัก
    const completeData = {
      ...measurementDataObj,
      points: pointsData
    };
    
    // ไฟล์จะถูกประมวลผลโดย imageController.uploadFiles middleware แล้ว
    const fileUploads = req.files || [];
    
    const result = await QualityMeasurementService.saveCompleteMeasurement(
      completeData,
      fileUploads
    );
    
    return res.status(201).json({
      success: true,
      message: "Complete measurement saved successfully",
      data: {
        id: result.id
      }
    });
  } catch (error) {
    console.error("Error saving complete measurement:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save complete measurement",
      error: error.message
    });
  }
};

// Export functions
module.exports = {
  getQualityItems,
  saveQualityInspection,
  saveQualityAttachments,
  checkQualityInspectionExists,
  uploadFile,
  // getReferenceImage,
  saveQualityMeasurement,
  saveMeasurementPoint,
  saveMeasurementAttachment,
  getQualityMeasurement,
  getQualityMeasurementsByMachine,
  saveCompleteMeasurement
};