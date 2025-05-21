// src/services/logSafetyService.js

const db = require("../config/database");

const logSafetyService = {
  async getPublicLogs({ customer, product, startDate, endDate }) {
    let query = `
      SELECT 
        ih.id,
        m.machine_name,
        m.machine_number,
        m.model,
        m.customer,
        m.product,
        ih.checked_at as last_check,
        ih.status,
        ih.checked_by,
        ih.created_at,
        ih.updated_at
      FROM safety_inspection_history ih
      JOIN machines m ON ih.machine_id = m.id
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
      query += ` AND m.product = $${paramCount}`;
      params.push(product);
      paramCount++;
    }

    if (startDate) {
      query += ` AND DATE(ih.checked_at) >= DATE($${paramCount})`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND DATE(ih.checked_at) <= DATE($${paramCount})`;
      params.push(endDate);
      paramCount++;
    }

    query += " ORDER BY ih.checked_at DESC";

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
        machine_name: row.machine_name || "",
        machine_number: row.machine_number || "",
        model: row.model || "",
        customer: row.customer || "",
        product: row.product || "",
        last_check: row.last_check
          ? new Date(row.last_check).toISOString()
          : new Date().toISOString(),
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
      throw new Error(`Failed to fetch logs: ${error.message}`);
    }
  },

  async getPublicLogById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format: ID must be a number");
    }

    const query = `
      SELECT 
        ih.id,
        m.machine_name,
        m.machine_number,
        m.model,
        m.customer,
        m.product,
        ih.checked_at as last_check,
        ih.status,
        ih.checked_by,
        ih.created_at,
        ih.updated_at
      FROM safety_inspection_history ih
      JOIN machines m ON ih.machine_id = m.id
      WHERE ih.id = $1
    `;
    try {
      const { rows } = await db.query(query, [id]);
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        machine_name: row.machine_name || "",
        machine_number: row.machine_number || "",
        model: row.model || "",
        customer: row.customer || "",
        product: row.product || "",
        last_check: row.last_check || new Date().toISOString(),
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

  async createLog(logData) {
    const findMachineQuery = `
      SELECT id FROM machines 
      WHERE machine_name = $1 OR machine_number = $2
    `;

    try {
      const { rows: machines } = await db.query(findMachineQuery, [
        logData.machine_name,
        logData.machine_number,
      ]);

      if (machines.length === 0) {
        throw new Error("Machine not found");
      }

      const machine_id = machines[0].id;

      const insertQuery = `
        INSERT INTO safety_inspection_history 
        (machine_id, checked_by, status, checked_at) 
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;

      const { rows } = await db.query(insertQuery, [
        machine_id,
        logData.checked_by,
        logData.status,
        logData.last_check || new Date(),
      ]);

      // Fetch and return the complete record
      return this.getPublicLogById(rows[0].id);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async updateLog(id, logData) {
    let machine_id = logData.machine_id;

    if (!machine_id && (logData.machine_name || logData.machine_number)) {
      const findMachineQuery = `
        SELECT id FROM machines 
        WHERE machine_name = $1 OR machine_number = $2
      `;
      const { rows: machines } = await db.query(findMachineQuery, [
        logData.machine_name,
        logData.machine_number,
      ]);

      if (machines.length > 0) {
        machine_id = machines[0].id;
      }
    }

    let query;
    let params;

    if (machine_id) {
      query = `
        UPDATE safety_inspection_history 
        SET 
          machine_id = $1,
          checked_by = $2,
          status = $3,
          checked_at = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id
      `;
      params = [
        machine_id,
        logData.checked_by,
        logData.status,
        logData.last_check,
        id,
      ];
    } else {
      query = `
        UPDATE safety_inspection_history 
        SET 
          checked_by = $1,
          status = $2,
          checked_at = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id
      `;
      params = [logData.checked_by, logData.status, logData.last_check, id];
    }

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
    const query = "DELETE FROM safety_inspection_history WHERE id = $1 RETURNING id";
    try {
      const { rows } = await db.query(query, [id]);
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
        FROM safety_inspection_history 
        WHERE machine_id = $1 
        AND DATE(checked_at) = DATE($2)
        AND shift = $3
      );
    `;

    console.log("Checking log:", { machine_id, date, shift });
    const result = await db.query(query, [machine_id, date, shift]);
    console.log("Check result:", result.rows[0]);

    return result.rows[0].exists;
  },
};

module.exports = logSafetyService;
