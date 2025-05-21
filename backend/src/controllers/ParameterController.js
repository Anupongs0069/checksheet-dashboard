// src/controllers/ParameterController.js

const ParameterService = require("../services/ParameterService");

// Get parameter list items by machine model ID
const getParameterItems = async (req, res) => {
  try {
    const { machineModelId, programName } = req.query;

    if (!machineModelId) {
      return res.status(400).json({
        success: false,
        message: "Machine model ID is required",
      });
    }

    // ส่ง programName ไปให้ Service ด้วย
    const result = await ParameterService.getParameterItems(
      machineModelId,
      programName
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching parameter items",
        error: result.error,
      });
    }

    if (result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No parameter items found for this machine model",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getParameterItems controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Save parameter inspection
const saveParameterInspection = async (req, res) => {
  try {
    const inspectionData = req.body;

    // Required fields validation
    const requiredFields = [
      "machine_id",
      "checked_by",
      "status",
      "checked_at",
      "shift",
      "work_order",
      "product_name",
      "program_name",
    ];

    const missingFields = requiredFields.filter(
      (field) => !inspectionData[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const result = await ParameterService.saveParameterInspection(
      inspectionData
    );

    if (!result.success) {
      // Check for duplicate entry error
      if (result.error && result.error.includes("duplicate")) {
        return res.status(409).json({
          success: false,
          message:
            "A parameter inspection record already exists for this machine, work order and shift",
          error: result.error,
        });
      }

      return res.status(500).json({
        success: false,
        message: "An error occurred while saving parameter inspection",
        error: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Parameter inspection saved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in saveParameterInspection controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Save parameter inspection attachments
const saveParameterAttachments = async (req, res) => {
  try {
    const attachments = req.body;

    // Validate input is an array
    if (!Array.isArray(attachments)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of attachments",
      });
    }

    // Check if array is empty
    if (attachments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No attachments to save",
        data: [],
      });
    }

    // Validate each attachment item
    for (const attachment of attachments) {
      if (
        !attachment.parameter_inspection_id ||
        !attachment.model_parameterlist_item_id
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each attachment must have parameter_inspection_id and model_parameterlist_item_id",
        });
      }
    }

    const result = await ParameterService.saveParameterAttachments(attachments);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message:
          "An error occurred while saving parameter inspection attachments",
        error: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Parameter inspection attachments saved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in saveParameterAttachments controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Check if parameter inspection exists
const checkParameterInspectionExists = async (req, res) => {
  try {
    const { machine_id, date, shift, work_order } = req.query;

    if (!machine_id || !date || !shift || !work_order) {
      return res.status(400).json({
        success: false,
        message: "Machine ID, date, shift, and work order are required",
      });
    }

    const result = await ParameterService.checkParameterInspectionExists(
      machine_id,
      date,
      shift,
      work_order
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while checking parameter inspection",
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      exists: result.exists,
    });
  } catch (error) {
    console.error("Error in checkParameterInspectionExists controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Upload file for parameter inspection
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    const inspectionId = req.body.inspectionId;

    const result = await ParameterService.uploadFile(req.file, inspectionId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading the file",
        error: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in uploadFile controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Save parameter inspection results
const saveParameterInspectionResults = async (req, res) => {
  try {
    let resultsData = req.body;

    if (!Array.isArray(resultsData)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of results",
      });
    }

    resultsData = resultsData.map(item => ({
      parameter_inspection_id: item.parameter_inspection_id,
      model_parameterlist_item_id: item.model_parameterlist_item_id,
      measured_value: item.measured_value !== null && item.measured_value !== undefined ? String(item.measured_value) : '',
      is_passed: item.is_passed === null || item.is_passed === undefined ? false : item.is_passed,
      notes: item.notes || null
    }));

    console.log("Data being sent to service:", JSON.stringify(resultsData, null, 2));

    const result = await ParameterService.saveParameterInspectionResults(
      resultsData
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while saving parameter inspection results",
        error: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Parameter inspection results saved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in saveParameterInspectionResults controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get parameter inspection results by inspection ID
const getParameterInspectionResults = async (req, res) => {
  try {
    const { inspectionId } = req.params;

    if (!inspectionId) {
      return res.status(400).json({
        success: false,
        message: "Inspection ID is required",
      });
    }

    const result = await ParameterService.getParameterInspectionResults(
      inspectionId
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message:
          "An error occurred while fetching parameter inspection results",
        error: result.error,
      });
    }

    if (result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No results found for this inspection",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getParameterInspectionResults controller:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = {
  getParameterItems,
  saveParameterInspection,
  saveParameterAttachments,
  checkParameterInspectionExists,
  uploadFile,
  saveParameterInspectionResults,
  getParameterInspectionResults,
};
