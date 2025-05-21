// ./src/services/LogParametersService.js

const db = require("../config/database");

const LogParametersService = {
  async getPublicLogs({ customer, product, startDate, endDate }) {
    let query = `
      SELECT 
        pih.id,
        pih.machine_id,
        m.machine_name,
        m.machine_number,
        m.model,
        m.customer,
        pih.product_name,
        pih.program_name,
        pih.work_order,
        pih.checked_at,
        pih.shift,
        pih.status,
        pih.checked_by,
        pih.created_at,
        pih.updated_at
      FROM parameter_inspection_history pih
      JOIN machines m ON pih.machine_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (customer) {
      query += ` AND m.customer = $${paramCount}`;
      params.push(customer);
      paramCount++;
    }

    if (product) {
      query += ` AND pih.product_name = $${paramCount}`;
      params.push(product);
      paramCount++;
    }

    if (startDate) {
      query += ` AND DATE(pih.checked_at) >= DATE($${paramCount})`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND DATE(pih.checked_at) <= DATE($${paramCount})`;
      params.push(endDate);
      paramCount++;
    }

    query += " ORDER BY pih.checked_at DESC";

    try {
      console.log("Executing query:", query);
      console.log("With parameters:", params);

      const { rows } = await db.query(query, params);

      if (!rows || rows.length === 0) {
        console.log("No results found");
        return [];
      }

      return rows.map((row) => ({
        id: row.id,
        machine_id: row.machine_id,
        machine_name: row.machine_name || "",
        machine_number: row.machine_number || "",
        model: row.model || "",
        customer: row.customer || "",
        product: row.product_name || "",
        program_name: row.program_name || "",
        work_order: row.work_order || "",
        checked_at: row.checked_at
          ? new Date(row.checked_at).toISOString()
          : new Date().toISOString(),
        last_check: row.checked_at
          ? new Date(row.checked_at).toISOString()
          : new Date().toISOString(), // For backward compatibility
        shift: row.shift || "",
        status: row.status || "",
        checked_by: row.checked_by || "",
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (error) {
      console.error("Database error details:", {
        message: error.message,
        stack: error.stack,
        query,
        params,
      });
      throw new Error(`Failed to fetch parameter inspections: ${error.message}`);
    }
  },

  async getPublicLogById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format: ID must be a number");
    }

    const query = `
      SELECT 
        pih.id,
        pih.machine_id,
        m.machine_name,
        m.machine_number,
        m.model,
        m.customer,
        pih.product_name,
        pih.program_name,
        pih.work_order,
        pih.checked_at,
        pih.shift,
        pih.status,
        pih.checked_by,
        pih.created_at,
        pih.updated_at
      FROM parameter_inspection_history pih
      JOIN machines m ON pih.machine_id = m.id
      WHERE pih.id = $1
    `;
    try {
      const { rows } = await db.query(query, [id]);
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        machine_id: row.machine_id,
        machine_name: row.machine_name || "",
        machine_number: row.machine_number || "",
        model: row.model || "",
        customer: row.customer || "",
        product: row.product_name || "",
        program_name: row.program_name || "",
        work_order: row.work_order || "",
        checked_at: row.checked_at
          ? new Date(row.checked_at).toISOString()
          : new Date().toISOString(),
        last_check: row.checked_at
          ? new Date(row.checked_at).toISOString()
          : new Date().toISOString(), // For backward compatibility
        shift: row.shift || "",
        status: row.status || "",
        checked_by: row.checked_by || "",
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async getInspectionAttachments(inspectionId) {
    const query = `
      SELECT 
        id, 
        parameter_inspection_id, 
        model_parameterlist_item_id, 
        description, 
        created_at, 
        updated_at
      FROM parameter_inspection_attachments
      WHERE parameter_inspection_id = $1
    `;

    try {
      const { rows } = await db.query(query, [inspectionId]);
      return rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async getParameterItems(machineId, programName) {
    let query = `
      SELECT 
        mpi.id, 
        mpi.machine_model_id, 
        mpi.item_name, 
        mpi.item_thai_name, 
        mpi.standard_value, 
        mpi.tolerance, 
        mpi.unit, 
        mpi.is_active, 
        mpi.program_name,
        mpi.created_at, 
        mpi.updated_at
      FROM model_parameterlist_items mpi
      JOIN machine_models mm ON mpi.machine_model_id = mm.id
      JOIN machines m ON mm.id = m.model
      WHERE m.id = $1
    `;
  
    const params = [machineId];
  
    if (programName) {
      query += ` AND mpi.program_name = $2`;
      params.push(programName);
    }
  
    query += ` AND mpi.is_active = true
      ORDER BY mpi.id`;
  
    try {
      const { rows } = await db.query(query, params);
      
      // ปรับให้เป็นรูปแบบที่ต้องการโดยไม่ต้องใช้ group_id
      const defaultGroup = {
        group: {
          id: 0,
          name: 'Default Group',
          thai_name: 'กลุ่มเริ่มต้น'
        },
        items: rows.map(row => ({
          id: row.id,
          item_name: row.item_name,
          item_thai_name: row.item_thai_name,
          standard_value: row.standard_value,
          tolerance: row.tolerance,
          unit: row.unit,
          program_name: row.program_name
        }))
      };
      
      return { groups: [defaultGroup] };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async createLog(logData) {
    const query = `
      INSERT INTO parameter_inspection_history 
      (machine_id, checked_by, status, checked_at, shift, work_order, product_name, program_name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    try {
      const { rows } = await db.query(query, [
        logData.machine_id,
        logData.checked_by,
        logData.status,
        logData.checked_at || logData.last_check || new Date(),
        logData.shift,
        logData.work_order,
        logData.product_name || logData.product,
        logData.program_name
      ]);

      // Fetch and return the complete record
      return this.getPublicLogById(rows[0].id);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async createAttachment(attachmentData) {
    const query = `
      INSERT INTO parameter_inspection_attachments
      (parameter_inspection_id, model_parameterlist_item_id, description)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    try {
      const { rows } = await db.query(query, [
        attachmentData.parameter_inspection_id,
        attachmentData.model_parameterlist_item_id,
        attachmentData.description || ''
      ]);

      return rows[0].id;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async updateLog(id, logData) {
    const query = `
      UPDATE parameter_inspection_history 
      SET 
        machine_id = $1,
        checked_by = $2,
        status = $3,
        checked_at = $4,
        shift = $5,
        work_order = $6,
        product_name = $7,
        program_name = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING id
    `;
    
    const params = [
      logData.machine_id,
      logData.checked_by,
      logData.status,
      logData.checked_at || logData.last_check,
      logData.shift,
      logData.work_order,
      logData.product_name || logData.product,
      logData.program_name,
      id
    ];

    try {
      const { rows } = await db.query(query, params);
      if (rows.length === 0) {
        return null;
      }

      return this.getPublicLogById(rows[0].id);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async deleteLog(id) {
    // First delete related attachments
    const deleteAttachmentsQuery = "DELETE FROM parameter_inspection_attachments WHERE parameter_inspection_id = $1";
    
    // Then delete the inspection
    const deleteInspectionQuery = "DELETE FROM parameter_inspection_history WHERE id = $1 RETURNING id";
    
    try {
      await db.query(deleteAttachmentsQuery, [id]);
      const { rows } = await db.query(deleteInspectionQuery, [id]);
      return rows.length > 0;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async checkDailyMachineLogExists(machine_id, date, shift) {
    const query = `
      SELECT EXISTS (
        SELECT 1 
        FROM parameter_inspection_history 
        WHERE machine_id = $1 
        AND DATE(checked_at) = DATE($2)
        AND shift = $3
      );
    `;

    console.log("Checking inspection:", { machine_id, date, shift });
    const result = await db.query(query, [machine_id, date, shift]);
    console.log("Check result:", result.rows[0]);

    return result.rows[0].exists;
  },
  async getSimpleParameterItems(machineModelId, programName) {
    try {
      console.log("Getting parameter items for model ID:", machineModelId);
      
      let query = `
        SELECT 
          id, 
          machine_model_id, 
          item_name, 
          item_thai_name, 
          standard_value, 
          tolerance, 
          unit, 
          is_active, 
          program_name
        FROM model_parameterlist_items
        WHERE is_active = true
      `;
      
      const params = [];
      let paramIndex = 1;
      
      query += ` AND machine_model_id = $${paramIndex}`;
      params.push(machineModelId);
      paramIndex++;
      
      if (programName) {
        query += ` AND program_name LIKE $${paramIndex}`;
        params.push(`%${programName}%`);
        paramIndex++;
      }
      
      query += ` ORDER BY id`;
      
      console.log("Executing query:", query);
      console.log("With parameters:", params);
      
      const { rows } = await db.query(query, params);
      console.log(`Query returned ${rows.length} rows`);
      
      const groupedByProgram = {};
      
      rows.forEach(row => {
        const programKey = row.program_name || 'No Program';
        
        if (!groupedByProgram[programKey]) {
          groupedByProgram[programKey] = {
            group: {
              id: 0,
              name: programKey,
              thai_name: `โปรแกรม ${programKey}`
            },
            items: []
          };
        }
        
        groupedByProgram[programKey].items.push({
          id: row.id,
          item_name: row.item_name,
          item_thai_name: row.item_thai_name,
          standard_value: row.standard_value,
          tolerance: row.tolerance,
          unit: row.unit,
          program_name: row.program_name
        });
      });
      
      return { groups: Object.values(groupedByProgram) };
    } catch (error) {
      console.error("Database error details:", {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  async getInspectionResults(inspectionId) {
    const query = `
      SELECT 
        id, 
        parameter_inspection_id, 
        model_parameterlist_item_id, 
        measured_value, 
        is_passed, 
        notes,
        created_at, 
        updated_at
      FROM parameter_inspection_results
      WHERE parameter_inspection_id = $1
    `;
  
    try {
      const { rows } = await db.query(query, [inspectionId]);
      return rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
};

module.exports = LogParametersService;