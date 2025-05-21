// ./src/controllers/qualityController.js

const QualityItemsService = require("../services/QualityItemsService");

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

const uploadFile = async (req, res) => {
  try {
    const { inspectionId } = req.body;
    const result = await QualityItemsService.uploadFile(req.file, inspectionId);
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

// เพิ่มฟังก์ชันสำหรับดึงตัวเลือก specification
const getSpecOptions = async (req, res) => {
  try {
    const { machine_model_id, bar_code_unit } = req.query;
    
    if (!machine_model_id || !bar_code_unit) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters"
      });
    }
    
    const options = await QualityItemsService.getSpecOptions(machine_model_id, bar_code_unit);
    
    return res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching specification options:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  getQualityItems,
  saveQualityInspection,
  saveQualityAttachments,
  checkQualityInspectionExists,
  uploadFile,
  getReferenceImage,
  getSpecOptions
};