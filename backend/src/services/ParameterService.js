// src/services/ParameterService.js

const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class ParameterService {
  // Get parameter list items by machine model ID
  async getParameterItems(machineModelId, programName) {
    try {
      let query = `
      SELECT id, machine_model_id, item_name, item_thai_name, standard_value, tolerance, unit, is_active, created_at, updated_at, program_name
      FROM public.model_parameterlist_items
      WHERE machine_model_id = $1 AND is_active = true
    `;

      let queryParams = [machineModelId];

      if (programName) {
        query += ` AND program_name = $2`;
        queryParams.push(programName);
      }

      query += ` ORDER BY id ASC`;

      const result = await pool.query(query, queryParams);
      return { success: true, data: result.rows };
    } catch (error) {
      console.error("Error fetching parameter items:", error);
      return { success: false, error: error.message };
    }
  }

  // Save parameter inspection
  async saveParameterInspection(inspectionData) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const {
        machine_id,
        checked_by,
        status,
        checked_at,
        shift,
        work_order,
        product_name,
        program_name,
      } = inspectionData;

      // Insert main inspection record
      const insertQuery = `
        INSERT INTO public.parameter_inspection_history (
          machine_id, checked_by, status, checked_at, 
          shift, work_order, product_name, program_name
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, machine_id, checked_by, status, checked_at, shift, 
                  work_order, product_name, program_name, created_at
      `;

      const insertValues = [
        machine_id,
        checked_by,
        status,
        checked_at,
        shift,
        work_order,
        product_name,
        program_name,
      ];

      const result = await client.query(insertQuery, insertValues);
      await client.query("COMMIT");

      return { success: true, data: result.rows };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error saving parameter inspection:", error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  // Save parameter inspection attachments for failed items
  async saveParameterAttachments(attachments) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const savedAttachments = [];

      for (const attachment of attachments) {
        const {
          parameter_inspection_id,
          model_parameterlist_item_id,
          description,
        } = attachment;

        const insertQuery = `
          INSERT INTO public.parameter_inspection_attachments (
            parameter_inspection_id, 
            model_parameterlist_item_id, 
            description
          ) 
          VALUES ($1, $2, $3)
          RETURNING id, parameter_inspection_id, model_parameterlist_item_id, description
        `;

        const insertValues = [
          parameter_inspection_id,
          model_parameterlist_item_id,
          description,
        ];

        const result = await client.query(insertQuery, insertValues);
        savedAttachments.push(result.rows[0]);
      }

      await client.query("COMMIT");
      return { success: true, data: savedAttachments };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error saving parameter inspection attachments:", error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  // Check if parameter inspection exists for machine, date, shift, and work order
  async checkParameterInspectionExists(machineId, date, shift, workOrder) {
    try {
      const query = `
        SELECT id FROM public.parameter_inspection_history
        WHERE machine_id = $1
        AND DATE(checked_at) = $2
        AND shift = $3
        AND work_order = $4
        LIMIT 1
      `;

      const result = await pool.query(query, [
        machineId,
        date,
        shift,
        workOrder,
      ]);
      return { success: true, exists: result.rows.length > 0 };
    } catch (error) {
      console.error("Error checking parameter inspection:", error);
      return { success: false, error: error.message };
    }
  }

  // Upload file for parameter inspection
  async uploadFile(file, inspectionId) {
    try {
      if (!file) {
        return { success: false, error: "No file provided" };
      }

      // Create directory if it doesn't exist
      const uploadDir = path.join(
        __dirname,
        "../../public/uploads/parameter_inspection"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const relativePath = `parameter_inspection/${fileName}`;

      // Save the file
      fs.writeFileSync(filePath, file.buffer);

      // Update inspection record with image URL if needed
      if (inspectionId) {
        try {
          const updateQuery = `
            UPDATE public.parameter_inspection_history
            SET image_url = $1
            WHERE id = $2
            RETURNING id, image_url
          `;

          await pool.query(updateQuery, [relativePath, inspectionId]);
        } catch (updateError) {
          console.error(
            "Error updating parameter inspection with image URL:",
            updateError
          );
          // Continue even if update fails
        }
      }

      return {
        success: true,
        data: {
          fileName,
          filePath: relativePath,
          fileUrl: `/uploads/${relativePath}`,
          inspectionId,
        },
      };
    } catch (error) {
      console.error("Error uploading file for parameter inspection:", error);
      return { success: false, error: error.message };
    }
  }

  async saveParameterInspectionResults(results) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const savedResults = [];

      for (const result of results) {
        const {
          parameter_inspection_id,
          model_parameterlist_item_id,
          measured_value,
          is_passed,
          notes,
        } = result;

        // เพิ่มการตรวจสอบค่าอย่างละเอียด
        if (!parameter_inspection_id) {
          throw new Error("parameter_inspection_id is required");
        }

        if (!model_parameterlist_item_id) {
          throw new Error("model_parameterlist_item_id is required");
        }

        // แปลงค่า is_passed ให้เป็น boolean ถ้าเป็น null หรือ undefined
        const isPassed =
          is_passed === null || is_passed === undefined ? false : is_passed;

        // แปลงค่า measured_value เป็น string ถ้าไม่ใช่
        const measuredValueStr =
          measured_value !== null && measured_value !== undefined
            ? String(measured_value)
            : "";

        const insertQuery = `
          INSERT INTO public.parameter_inspection_results (
            parameter_inspection_id,
            model_parameterlist_item_id,
            measured_value,
            is_passed,
            notes
          ) 
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, parameter_inspection_id, model_parameterlist_item_id, measured_value, is_passed, notes, created_at, updated_at
        `;

        const insertValues = [
          parameter_inspection_id,
          model_parameterlist_item_id,
          measuredValueStr, // ใช้ค่าที่แปลงแล้ว
          isPassed, // ใช้ค่าที่แปลงแล้ว
          notes || null, // แปลงค่า undefined เป็น null
        ];

        const queryResult = await client.query(insertQuery, insertValues);
        savedResults.push(queryResult.rows[0]);
      }

      await client.query("COMMIT");
      return { success: true, data: savedResults };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error saving parameter inspection results:", error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  async getParameterInspectionResults(inspectionId) {
    try {
      const query = `
      SELECT r.id, r.parameter_inspection_id, r.model_parameterlist_item_id, r.measured_value, r.is_passed, r.notes, r.created_at, r.updated_at,
             i.item_name, i.item_thai_name, i.standard_value, i.tolerance, i.unit
      FROM public.parameter_inspection_results r
      JOIN public.model_parameterlist_items i ON r.model_parameterlist_item_id = i.id
      WHERE r.parameter_inspection_id = $1
      ORDER BY i.id ASC
    `;

      const result = await pool.query(query, [inspectionId]);
      return { success: true, data: result.rows };
    } catch (error) {
      console.error("Error fetching parameter inspection results:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ParameterService();
