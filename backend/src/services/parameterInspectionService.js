// src/services/parameterInspectionService.js
const db = require("../config/database");

/**
 * ดึงข้อมูลรายละเอียดการตรวจเช็คพารามิเตอร์
 * @param {number|null} inspectionId - ID ของการตรวจสอบที่ต้องการ (หากไม่ระบุจะดึงทั้งหมด)
 * @returns {Promise<Array>} ข้อมูลการตรวจสอบพารามิเตอร์
 */
const getParameterInspectionDetails = async (inspectionId = null) => {
  const client = await db.connect();
  
  try {
    console.log('Service: Fetching parameter inspection details');
    
    let query = `
      SELECT 
        pih.id AS inspection_id,
        pih.machine_id,
        pih.checked_by,
        pih.status,
        pih.checked_at,
        pih.shift,
        pih.work_order,
        pih.product_name,
        pih.program_name,
        m.machine_name,
        m.machine_number,
        m.model,
        m.series_number,
        m.customer,
        m.product
      FROM 
        parameter_inspection_history pih
      JOIN 
        machines m ON pih.machine_id = m.id
    `;
    
    const params = [];
    
    if (inspectionId) {
      query += ` WHERE pih.id = $1`;
      params.push(inspectionId);
    }
    
    query += ` ORDER BY pih.checked_at DESC`;
    
    const result = await client.query(query, params);
    
    return result.rows;
  } catch (error) {
    console.error("Error in getParameterInspectionDetails service:", error);
    throw new Error(`Failed to retrieve parameter inspection details: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * ดึงข้อมูลรายการพารามิเตอร์ที่เกี่ยวข้องกับการตรวจสอบหนึ่งๆ
 * @param {number} inspectionId - ID ของการตรวจสอบที่ต้องการ
 * @returns {Promise<Array>} ข้อมูลรายการพารามิเตอร์
 */
const getParameterItemsForInspection = async (inspectionId) => {
  const client = await db.connect();
  
  try {
    console.log(`Service: Fetching parameter items for inspection ID: ${inspectionId}`);
    
    const query = `
      SELECT 
        pih.id AS inspection_id,
        pih.machine_id,
        pih.program_name AS inspection_program,
        mpi.id AS parameter_item_id,
        mpi.item_name,
        mpi.standard_value,
        mpi.tolerance,
        mpi.unit,
        mpi.program_name AS parameter_program
      FROM 
        parameter_inspection_history pih
      CROSS JOIN 
        model_parameterlist_items mpi
      JOIN
        machines m ON pih.machine_id = m.id
      JOIN
        machine_models mm ON m.model = mm.model AND m.machine_name = mm.machine_name
      WHERE 
        mpi.machine_model_id = mm.id
        AND (mpi.program_name IS NULL OR mpi.program_name = pih.program_name)
        AND pih.id = $1
      ORDER BY 
        mpi.id
    `;
    
    const result = await client.query(query, [inspectionId]);
    
    return result.rows;
  } catch (error) {
    console.error(`Error in getParameterItemsForInspection service:`, error);
    throw new Error(`Failed to retrieve parameter items: ${error.message}`);
  } finally {
    client.release();
  }
};

module.exports = {
  getParameterInspectionDetails,
  getParameterItemsForInspection
};