// ./src/controllers/MachineMaintenanceController.js
const MachineMaintenanceService = require("../services/MachineMaintenanceService");

// Get latest info about a machine (combined status and latest downtime)
const getLatestMachineInfo = async (req, res) => {
  try {
    const { machineId } = req.params;
    const latestInfo = await MachineMaintenanceService.getLatestMachineInfo(machineId);
    
    return res.status(200).json({
      success: true,
      data: latestInfo
    });
  } catch (error) {
    console.error("Error in getLatestMachineInfo:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve latest machine information",
      error: error.message
    });
  }
};

module.exports = {
  getLatestMachineInfo
};