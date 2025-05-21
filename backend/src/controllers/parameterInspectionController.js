// src/controllers/parameterInspectionController.js
const parameterInspectionService = require("../services/parameterInspectionService");

/**
 * ดึงข้อมูลรายละเอียดการตรวจเช็คพารามิเตอร์
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getParameterInspectionDetails = async (req, res) => {
  try {
    console.log('Controller: Getting parameter inspection details');
    const { inspection_id } = req.query;
    
    const result = await parameterInspectionService.getParameterInspectionDetails(inspection_id);
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error("Error in getParameterInspectionDetails controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve parameter inspection details",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

/**
 * ดึงข้อมูลรายการพารามิเตอร์ที่เกี่ยวข้องกับการตรวจสอบหนึ่งๆ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 */
const getParameterResults = async (req, res) => {
  try {
    console.log('Controller: Getting parameter items for inspection');
    const { inspection_id } = req.query;
    
    if (!inspection_id) {
      return res.status(400).json({
        success: false,
        message: "Inspection ID is required"
      });
    }
    
    const results = await parameterInspectionService.getParameterItemsForInspection(inspection_id);
    
    res.status(200).json({
      success: true,
      inspection_id: parseInt(inspection_id),
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error("Error in getParameterResults controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve parameter items",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

module.exports = {
  getParameterInspectionDetails,
  getParameterResults
};