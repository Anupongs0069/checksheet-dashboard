// src/controllers/machineModelsController.js

const machineModelsService = require('../services/machineModelsService');

const findMachineModelIdController = async (req, res) => {
  try {
    const { machine_name, model } = req.query;
    
    if (!machine_name || !model) {
      return res.status(400).json({ error: 'Missing machine name or model' });
    }

    const machineModelId = await machineModelsService.findMachineModelId(machine_name, model);
    
    if (machineModelId) {
      return res.json({ machine_model_id: machineModelId });
    }
    
    res.status(404).json({ error: 'Machine model not found' });
  } catch (error) {
    console.error("Error in findMachineModelIdController:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProgramNamesByModelIdController = async (req, res) => {
  try {
    const { machine_model_id } = req.query;
    
    if (!machine_model_id) {
      return res.status(400).json({ error: 'Missing machine_model_id parameter' });
    }
    
    const programNames = await machineModelsService.getProgramNamesByModelId(machine_model_id);
    
    if (programNames && programNames.length > 0) {
      return res.json({ program_names: programNames });
    }
    
    res.status(404).json({ error: 'No program names found for the given machine model ID' });
  } catch (error) {
    console.error("Error in getProgramNamesByModelIdController:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  findMachineModelIdController,
  getProgramNamesByModelIdController,
};