// src/services/inspectionsService.js

const db = require("../config/database");

const inspectionsService = {
  // Pull up all checklists
  async getAllInspections() {
    const query = `
      SELECT *
      FROM inspection_history
      ORDER BY checked_at DESC, created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Pull checklist by ID
  async getInspectionById(id) {
    const query = `
      SELECT *
      FROM inspection_history
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Pull up inspection list by machine
  async getInspectionsByMachine(machine_id) {
    const query = `
      SELECT *
      FROM inspection_history
      WHERE machine_id = $1
      ORDER BY checked_at DESC, created_at DESC
    `;
    const result = await db.query(query, [machine_id]);
    return result.rows;
  },

  // Pull checklist by status
  async getInspectionsByStatus(status) {
    const query = `
      SELECT *
      FROM inspection_history
      WHERE status = $1
      ORDER BY checked_at DESC, created_at DESC
    `;
    const result = await db.query(query, [status.toLowerCase()]);
    return result.rows;
  },

  // Create a new checklist
  async createInspection(inspectionData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      
      const { 
        machine_id, 
        checked_by, 
        status, 
        checked_at, 
        shift,
        is_daily,
        is_weekly,
        is_monthly,
        is_quarterly,
        is_6_months,
        is_yearly
      } = inspectionData;
      
      const checkDate = new Date(checked_at || new Date());
      const hour = checkDate.getHours();
      
      let determinedShift = shift || "D";
      if (hour >= 18 || hour < 6) {
        determinedShift = "N";
      }
      
      // ตรวจสอบว่า shift มีค่าหรือไม่
      if (!shift) {
        throw new Error("Shift is required.");
      }
      
      // Check for duplicate inspection based on machine_id, date, and shift
      const checkQuery = `
        SELECT 1 FROM inspection_history 
        WHERE machine_id = $1 
        AND DATE(checked_at) = DATE($2)
        AND shift = $3
      `;
      
      const checkResult = await client.query(checkQuery, [
        machine_id,
        checkDate,
        shift,
      ]);
      
      console.log("Check duplicate with params:", {
        machine_id,
        date: checkDate.toISOString(),
        formattedDate: checkDate.toLocaleDateString(),
        shift,
      });
      
      console.log("Check Result:", {
        rowCount: checkResult.rowCount,
        hasRows: checkResult.rows.length > 0,
      });
      
      const verifyQuery = `
        SELECT * FROM inspection_history 
        WHERE machine_id = $1 
        AND DATE(checked_at) = $2`;
      
      const verifyResult = await client.query(verifyQuery, [
        machine_id,
        checkDate,
      ]);
      
      console.log("Existing records:", verifyResult.rows);
      
      if (checkResult.rows.length > 0) {
        console.log(
          `Duplicate entry detected for machine_id: ${machine_id}, date: ${checkDate}, shift: ${shift}`
        );
        throw new Error(
          `This machine has been inspected on ${checkDate.toLocaleDateString()} for the ${
            shift === "D" ? "day" : "night"
          }`
        );
      } else {
        console.log(
          `No duplicate entry for machine_id: ${machine_id}, date: ${checkDate}, shift: ${shift}`
        );
      }
      
      const insertQuery = `
        INSERT INTO inspection_history (
          id,
          machine_id,
          checked_by,
          status,
          checked_at,
          shift,
          is_daily,
          is_weekly,
          is_monthly,
          is_quarterly,
          is_6_months,
          is_yearly,
          created_at,
          updated_at
        )
        VALUES (
          nextval('inspection_history_id_seq'), 
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP
        )
        RETURNING *
      `;
      
      const values = [
        machine_id,
        checked_by,
        status.toLowerCase(),
        checkDate,
        shift,
        is_daily,
        is_weekly,
        is_monthly,
        is_quarterly,
        is_6_months,
        is_yearly
      ];
      
      console.log("Inserting with values:", values);
      
      const result = await client.query(insertQuery, values);
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Record attachment for failed inspection
  async createInspectionAttachments(attachmentsData) {
    try {
      const { inspection_id, model_checklist_item_id, description } =
        attachmentsData;

      const query = `
        INSERT INTO inspection_attachments (
          inspection_id,
          model_checklist_item_id,
          description,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [inspection_id, model_checklist_item_id, description];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in createInspectionAttachments:", error);
      throw error;
    }
  },

  // Update status
  async updateStatus(id, status) {
    const query = `
      UPDATE inspection_history
      SET 
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status.toLowerCase(), id]);
    return result.rows[0];
  },

  // Delete checklist
  async deleteInspection(id) {
    const query = `DELETE FROM inspection_history WHERE id = $1`;
    await db.query(query, [id]);
  },

  // ดึงประวัติการตรวจเช็ค
  async getInspectionHistory(options) {
    const { machine_id, start_date, end_date } = options;

    let query = `
      SELECT *
      FROM inspection_history
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (machine_id) {
      query += ` AND machine_id = $${paramIndex}`;
      params.push(machine_id);
      paramIndex++;
    }

    if (start_date) {
      query += ` AND checked_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      query += ` AND checked_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    query += ` ORDER BY checked_at DESC, created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  },

  async getChecklistByFrequencies(machineName, model, frequencies) {
    const query = `
      SELECT 
        mi.id,
        mi.item_name,
        mi.item_thai_name,
        mi.frequency,
        mg.name as group_name,
        mg.thai_name as group_thai_name
      FROM public.model_checklist_items mi
      JOIN public.checklist_groups mg ON mi.group_id = mg.id
      WHERE mi.machine_name = $1
      AND mi.machine_model_id = $2
      AND mi.frequency = ANY($3)
      ORDER BY 
        CASE mi.frequency
          WHEN 'daily' THEN 1
          WHEN 'weekly' THEN 2
          WHEN 'monthly' THEN 3
          WHEN 'quarterly' THEN 4
          WHEN '6_months' THEN 5
          WHEN 'yearly' THEN 6
        END,
        mi.group_id, 
        mi.order_number
    `;

    const result = await db.query(query, [machineName, model, frequencies]);
    return result.rows;
  },

  async getInspectionWithShift(id) {
    const query = `
      SELECT h.*
      FROM inspection_history
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async getInspectionAttachments(inspection_id) {
    try {
      const query = `
        SELECT model_checklist_item_id, description
        FROM inspection_attachments
        WHERE inspection_id = $1
      `;

      const result = await db.query(query, [inspection_id]);
      return result.rows;
    } catch (error) {
      console.error("Error in getInspectionAttachments service:", error);
      throw error;
    }
  },
};

module.exports = inspectionsService;
