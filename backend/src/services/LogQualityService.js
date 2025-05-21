// ./src/services/LogQualityService.js

const db = require("../config/database");

const LogQualityService = {
  async getPublicInspections({
    employee_id,
    work_order,
    machine_id,
    startDate,
    endDate,
    today,
  }) {
    let query = `
  SELECT 
    id,
    machine_id,
    machine_model_id,
    employee_id,
    lead_employee_id,
    work_order,
    barcode_unit,
    inspection_date,
    shift,
    overall_result,
    remarks,
    created_at,
    updated_at
  FROM quality_inspections
  WHERE 1=1
`;

    const params = [];
    let paramCount = 1;

    if (employee_id) {
      query += ` AND (employee_id = $${paramCount} OR lead_employee_id = $${paramCount})`;
      params.push(employee_id);
      paramCount++;
    }

    if (work_order) {
      query += ` AND work_order = $${paramCount}`;
      params.push(work_order);
      paramCount++;
    }

    if (machine_id) {
      query += ` AND machine_id = $${paramCount}`;
      params.push(parseInt(machine_id));
      paramCount++;
    }

    if (today) {
      query += ` AND DATE(inspection_date) = CURRENT_DATE`;
    } else {
      if (startDate) {
        query += ` AND DATE(inspection_date) >= DATE($${paramCount})`;
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        query += ` AND DATE(inspection_date) <= DATE($${paramCount})`;
        params.push(endDate);
        paramCount++;
      }
    }

    query += " ORDER BY inspection_date DESC";

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
        machine_model_id: row.machine_model_id,
        employee_id: row.employee_id,
        lead_employee_id: row.lead_employee_id,
        work_order: row.work_order || "",
        barcode_unit: row.barcode_unit || "",
        inspection_date: row.inspection_date
          ? new Date(row.inspection_date).toISOString()
          : new Date().toISOString(),
        shift: row.shift || "",
        overall_result: row.overall_result || "",
        remarks: row.remarks || "",
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
      throw new Error(`Failed to fetch quality inspections: ${error.message}`);
    }
  },

  async getPublicInspectionById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format: ID must be a number");
    }

    const query = `
      SELECT 
        id,
        machine_id,
        machine_model_id,
        employee_id,
        lead_employee_id,
        work_order,
        barcode_unit,
        inspection_date,
        shift,
        overall_result,
        remarks,
        created_at,
        updated_at
      FROM quality_inspections
      WHERE id = $1
    `;
    try {
      const { rows } = await db.query(query, [id]);
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        machine_id: row.machine_id,
        machine_model_id: row.machine_model_id,
        employee_id: row.employee_id,
        lead_employee_id: row.lead_employee_id,
        work_order: row.work_order || "",
        barcode_unit: row.barcode_unit || "",
        inspection_date: row.inspection_date
          ? new Date(row.inspection_date).toISOString()
          : new Date().toISOString(),
        shift: row.shift || "",
        overall_result: row.overall_result || "",
        remarks: row.remarks || "",
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async getInspectionItems(inspection_id) {
    const query = `
      SELECT 
        qii.id,
        qii.inspection_id,
        qii.quality_item_id,
        qii.standard_value,
        qii.tolerance,
        qii.unit,
        qii.created_at,
        qii.updated_at,
        qi.item as item_name,
        qi.thai_item as item_thai_name
      FROM quality_inspection_items qii
      LEFT JOIN quality_items qi ON qii.quality_item_id = qi.id
      WHERE qii.inspection_id = $1
      ORDER BY qii.id
    `;

    try {
      const { rows } = await db.query(query, [inspection_id]);
      return rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async getInspectionMeasurements(inspection_item_id) {
    const query = `
      SELECT 
        id,
        inspection_item_id,
        point_number,
        measured_value,
        status,
        issue_detail,
        image_url,
        created_at,
        updated_at
      FROM quality_inspection_measurements
      WHERE inspection_item_id = $1
      ORDER BY point_number
    `;

    try {
      const { rows } = await db.query(query, [inspection_item_id]);
      return rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async getMachines() {
    const query = `
      SELECT 
        id,
        machine_name,
        machine_number,
        model,
        series_number,
        customer,
        product,
        created_at,
        updated_at
      FROM machines
      ORDER BY machine_name
    `;

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async getMachineModels() {
    const query = `
      SELECT 
        id,
        machine_name,
        model
      FROM machine_models
      ORDER BY machine_name
    `;

    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async createInspection(inspectionData) {
    const query = `
      INSERT INTO quality_inspections 
      (machine_id, machine_model_id, employee_id, lead_employee_id, work_order, barcode_unit, inspection_date, shift, overall_result, remarks) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;

    try {
      const { rows } = await db.query(query, [
        inspectionData.machine_id,
        inspectionData.machine_model_id,
        inspectionData.employee_id,
        inspectionData.lead_employee_id,
        inspectionData.work_order,
        inspectionData.barcode_unit,
        inspectionData.inspection_date || new Date(),
        inspectionData.shift,
        inspectionData.overall_result,
        inspectionData.remarks || "",
      ]);

      // Fetch and return the complete record
      return this.getPublicInspectionById(rows[0].id);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async createInspectionItem(itemData) {
    const query = `
      INSERT INTO quality_inspection_items
      (inspection_id, quality_item_id, standard_value, tolerance, unit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    try {
      const { rows } = await db.query(query, [
        itemData.inspection_id,
        itemData.quality_item_id,
        itemData.standard_value,
        itemData.tolerance,
        itemData.unit,
      ]);

      return rows[0].id;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async createInspectionMeasurement(measurementData) {
    const query = `
      INSERT INTO quality_inspection_measurements
      (inspection_item_id, point_number, measured_value, status, issue_detail, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    try {
      const { rows } = await db.query(query, [
        measurementData.inspection_item_id,
        measurementData.point_number,
        measurementData.measured_value,
        measurementData.status,
        measurementData.issue_detail || null,
        measurementData.image_url || null,
      ]);

      return rows[0].id;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async saveCompleteMeasurements(measurementData, points) {
    // Use a transaction to ensure data consistency
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      // 1. Create inspection record
      const inspectionQuery = `
        INSERT INTO quality_inspections 
        (machine_id, machine_model_id, employee_id, lead_employee_id, work_order, barcode_unit, inspection_date, shift, overall_result, remarks) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      const inspectionResult = await client.query(inspectionQuery, [
        measurementData.machine_id,
        measurementData.machine_model_id,
        measurementData.employee_id,
        measurementData.lead_employee_id,
        measurementData.work_order,
        measurementData.barcode_unit,
        new Date(),
        measurementData.shift,
        measurementData.overall_result,
        measurementData.remarks || "",
      ]);

      const inspectionId = inspectionResult.rows[0].id;

      // 2. Create inspection item record
      const itemQuery = `
        INSERT INTO quality_inspection_items
        (inspection_id, quality_item_id, standard_value, tolerance, unit)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const itemResult = await client.query(itemQuery, [
        inspectionId,
        measurementData.quality_item_id,
        measurementData.standard_value,
        measurementData.tolerance,
        measurementData.unit,
      ]);

      const itemId = itemResult.rows[0].id;

      // 3. Create all measurement points
      for (const point of points) {
        const measurementQuery = `
          INSERT INTO quality_inspection_measurements
          (inspection_item_id, point_number, measured_value, status, issue_detail)
          VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(measurementQuery, [
          itemId,
          point.point_number,
          point.measured_value,
          point.status,
          point.issue_detail || null,
        ]);
      }

      await client.query("COMMIT");

      return {
        inspection_id: inspectionId,
        inspection_item_id: itemId,
        point_count: points.length,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction error:", error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateInspection(id, inspectionData) {
    const query = `
      UPDATE quality_inspections 
      SET 
        machine_id = $1,
        machine_model_id = $2,
        employee_id = $3,
        lead_employee_id = $4,
        work_order = $5,
        barcode_unit = $6,
        inspection_date = $7,
        shift = $8,
        overall_result = $9,
        remarks = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING id
    `;

    const params = [
      inspectionData.machine_id,
      inspectionData.machine_model_id,
      inspectionData.employee_id,
      inspectionData.lead_employee_id,
      inspectionData.work_order,
      inspectionData.barcode_unit,
      inspectionData.inspection_date,
      inspectionData.shift,
      inspectionData.overall_result,
      inspectionData.remarks || "",
      id,
    ];

    try {
      const { rows } = await db.query(query, params);
      if (rows.length === 0) {
        return null;
      }

      return this.getPublicInspectionById(rows[0].id);
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async deleteInspection(id) {
    // Delete in reverse order to maintain referential integrity
    // First delete related measurements
    const deleteMeasurementsQuery = `
      DELETE FROM quality_inspection_measurements
      WHERE inspection_item_id IN (
        SELECT id FROM quality_inspection_items WHERE inspection_id = $1
      )
    `;

    // Then delete inspection items
    const deleteItemsQuery =
      "DELETE FROM quality_inspection_items WHERE inspection_id = $1";

    // Finally delete the inspection
    const deleteInspectionQuery =
      "DELETE FROM quality_inspections WHERE id = $1 RETURNING id";

    try {
      await db.query(deleteMeasurementsQuery, [id]);
      await db.query(deleteItemsQuery, [id]);
      const { rows } = await db.query(deleteInspectionQuery, [id]);
      return rows.length > 0;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  },

  async checkInspectionExists(machine_id, date, shift, work_order) {
    let query = `
      SELECT EXISTS (
        SELECT 1 
        FROM quality_inspections 
        WHERE machine_id = $1 
        AND DATE(inspection_date) = DATE($2)
        AND shift = $3
    `;

    const params = [machine_id, date, shift];
    let paramCount = 4;

    if (work_order) {
      query += ` AND work_order = $${paramCount}`;
      params.push(work_order);
      paramCount++;
    }

    query += ");";

    console.log("Checking inspection:", {
      machine_id,
      date,
      shift,
      work_order,
    });
    const result = await db.query(query, params);
    console.log("Check result:", result.rows[0]);

    return result.rows[0].exists;
  },

  // Function to Retrieve All Quality Inspection Items

  async getAllInspectionItems(filters = {}) {
    // สร้างคำสั่ง SQL พื้นฐาน
    let query = `
    SELECT 
      id, 
      inspection_id, 
      quality_item_id, 
      standard_value, 
      tolerance, 
      unit, 
      created_at, 
      updated_at
    FROM quality_inspection_items
    WHERE 1=1
  `;

    const params = [];
    let paramCount = 1;

    if (filters.inspection_id) {
      query += ` AND inspection_id = $${paramCount}`;
      params.push(parseInt(filters.inspection_id));
      paramCount++;
    }

    if (filters.quality_item_id) {
      query += ` AND quality_item_id = $${paramCount}`;
      params.push(parseInt(filters.quality_item_id));
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND DATE(created_at) >= DATE($${paramCount})`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND DATE(created_at) <= DATE($${paramCount})`;
      params.push(filters.endDate);
      paramCount++;
    }

    if (filters.today) {
      query += ` AND DATE(created_at) = CURRENT_DATE`;
    }

    query += " ORDER BY inspection_id, id";

    try {
      console.log("Executing query:", query);
      console.log("With parameters:", params);

      const { rows } = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error("Database error in getAllInspectionItems:", error);
      throw new Error(`Failed to fetch all inspection items: ${error.message}`);
    }
  },

  // Function to Retrieve All Quality Inspection Measurements

async getAllInspectionMeasurements(filters = {}) {
  let query = `
    SELECT 
      id, 
      inspection_item_id, 
      point_number, 
      measured_value, 
      status, 
      issue_detail, 
      image_url, 
      created_at, 
      updated_at
    FROM quality_inspection_measurements
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (filters.inspection_item_id) {
    query += ` AND inspection_item_id = $${paramCount}`;
    params.push(parseInt(filters.inspection_item_id));
    paramCount++;
  }
  
  if (filters.point_number) {
    query += ` AND point_number = $${paramCount}`;
    params.push(parseInt(filters.point_number));
    paramCount++;
  }
  
  if (filters.status) {
    query += ` AND status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }
  
  if (filters.startDate) {
    query += ` AND DATE(created_at) >= DATE($${paramCount})`;
    params.push(filters.startDate);
    paramCount++;
  }
  
  if (filters.endDate) {
    query += ` AND DATE(created_at) <= DATE($${paramCount})`;
    params.push(filters.endDate);
    paramCount++;
  }
  
  if (filters.today) {
    query += ` AND DATE(created_at) = CURRENT_DATE`;
  }
  
  query += " ORDER BY inspection_item_id, point_number";
  
  try {
    console.log("Executing query:", query);
    console.log("With parameters:", params);
    
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error("Database error in getAllInspectionMeasurements:", error);
    throw new Error(`Failed to fetch all inspection measurements: ${error.message}`);
  }
},

  // Function to Retrieve Combined Data of Quality Inspection, Including Items and Measurements
  async getCompleteInspectionData(inspection_id) {
    try {
      // 1. Retrieve Quality Inspection Data
      const inspection = await this.getPublicInspectionById(inspection_id);

      if (!inspection) {
        return null;
      }

      // 2. Retrieve Inspection Items Data
      const items = await this.getInspectionItems(inspection_id);

      // 3. Retrieve Measurement Data for Each Item
      const completeItems = await Promise.all(
        items.map(async (item) => {
          const measurements = await this.getInspectionMeasurements(item.id);
          return {
            ...item,
            measurements,
          };
        })
      );

      return {
        inspection,
        items: completeItems,
      };
    } catch (error) {
      console.error("Database error in getCompleteInspectionData:", error);
      throw new Error(
        `Failed to fetch complete inspection data: ${error.message}`
      );
    }
  },
};

module.exports = LogQualityService;
