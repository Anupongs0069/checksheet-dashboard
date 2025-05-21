// src/services/machineModelsService.js

const pool = require("../config/database");

const findMachineModelId = async (machineName, model) => {
  try {
    const result = await pool.query(
      `SELECT id AS machine_model_id 
         FROM public.machine_models 
         WHERE machine_name = $1 AND model = $2`,
      [machineName, model]
    );
    return result.rows[0] ? result.rows[0].machine_model_id : null;
  } catch (error) {
    console.error("Error finding machine model ID:", error);
    return null;
  }
};

const getProgramNamesByModelId = async (machineModelId) => {
  try {

    const result = await pool.query(
      'SELECT DISTINCT program_name FROM public.model_parameterlist_items WHERE machine_model_id = $1 AND is_active = true AND program_name IS NOT NULL AND program_name != \'\'',
      [machineModelId]
    );

    return result.rows.map(row => row.program_name);
  } catch (error) {
    console.error("Error in getProgramNamesByModelId service:", error);
    throw error;
  }
};

module.exports = {
  findMachineModelId,
  getProgramNamesByModelId,
};
