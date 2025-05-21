// ./src/services/MachineMaintenanceService.js
const db = require("../config/database");

class MachineMaintenanceService {
  // Get latest machine information (combines status and latest downtime)
  static async getLatestMachineInfo(machineId) {
    try {
      const query = `
        SELECT 
          md.problem_type,
          md.problem_description,
          md.work_order,
          md.technician_id,
          md.reported_by,
          md.solution_description,
          ms.id AS machine_status_id,
          ms.status
        FROM 
          (SELECT * FROM public.machine_downtime WHERE machine_id = $1 ORDER BY start_time DESC LIMIT 1) md,
          (SELECT * FROM public.machine_status WHERE machine_id = $1 ORDER BY updated_at DESC LIMIT 1) ms
      `;
      
      const result = await db.query(query, [machineId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Database error in getLatestMachineInfo:", error);
      throw new Error(`Failed to get latest machine info: ${error.message}`);
    }
  }
}

module.exports = MachineMaintenanceService;