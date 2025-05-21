// ./src/services/QualityMeasurementService.js

const pool = require("../config/database");

/**
 * บันทึกการตรวจสอบคุณภาพใหม่
 */
const saveQualityMeasurement = async (measurementData) => {
  const {
    machine_id,
    machine_model_id,
    quality_item_id,
    employee_id,
    lead_employee_id,
    work_order,
    barcode_unit,
    shift,
    standard_value,
    tolerance,
    unit,
    overall_result,
    remarks,
  } = measurementData;

  const result = await pool.query(
    `INSERT INTO quality_measurement_inspections 
     (machine_id, machine_model_id, quality_item_id, employee_id, lead_employee_id,
      work_order, barcode_unit, shift, standard_value, tolerance, unit, overall_result, remarks)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id`,
    [
      machine_id,
      machine_model_id,
      quality_item_id,
      employee_id,
      lead_employee_id,
      work_order,
      barcode_unit,
      shift,
      standard_value,
      tolerance,
      unit,
      overall_result,
      remarks,
    ]
  );

  return {
    success: true,
    id: result.rows[0].id,
  };
};

/**
 * บันทึกข้อมูลจุดวัด
 */
const saveMeasurementPoint = async (pointData) => {
  const { inspection_id, point_number, measured_value, status, issue_detail } =
    pointData;

  const result = await pool.query(
    `INSERT INTO quality_measurement_points 
     (inspection_id, point_number, measured_value, status, issue_detail)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [inspection_id, point_number, measured_value, status, issue_detail]
  );

  return {
    success: true,
    id: result.rows[0].id,
  };
};

/**
 * บันทึกไฟล์แนบ
 */
const saveMeasurementAttachment = async (fileData, file) => {
  const { measurement_point_id } = fileData;

  const result = await pool.query(
    `INSERT INTO quality_measurement_attachments 
     (measurement_point_id, file_name, file_path, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      measurement_point_id,
      file.originalname,
      file.path,
      file.mimetype,
      file.size,
    ]
  );

  return {
    success: true,
    id: result.rows[0].id,
    file_path: file.path,
  };
};

/**
 * ดึงข้อมูลการตรวจสอบตาม ID
 */
const getQualityMeasurementById = async (id) => {
  // ดึงข้อมูลหลัก
  const inspectionResult = await pool.query(
    `SELECT * FROM quality_inspections WHERE id = $1`,
    [id]
  );
  
  if (inspectionResult.rows.length === 0) {
    return {
      success: false,
      message: "Inspection not found"
    };
  }
  
  const inspection = inspectionResult.rows[0];
  
  // ดึงข้อมูลรายการตรวจสอบ
  const itemsResult = await pool.query(
    `SELECT * FROM quality_inspection_items WHERE inspection_id = $1`,
    [id]
  );
  
  const items = await Promise.all(itemsResult.rows.map(async (item) => {
    // ดึงข้อมูลการวัด
    const measurementsResult = await pool.query(
      `SELECT * FROM quality_inspection_measurements WHERE inspection_item_id = $1 ORDER BY point_number`,
      [item.id]
    );
    
    return {
      ...item,
      measurements: measurementsResult.rows
    };
  }));
  
  return {
    success: true,
    data: {
      inspection,
      items
    }
  };
};

/**
 * ดึงรายการตรวจสอบทั้งหมดสำหรับเครื่อง
 */
const getQualityMeasurementsByMachine = async (machineId, limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT * FROM quality_inspections 
     WHERE machine_id = $1 
     ORDER BY inspection_date DESC, created_at DESC
     LIMIT $2 OFFSET $3`,
    [machineId, limit, offset]
  );
  
  return {
    success: true,
    data: result.rows
  };
};

/**
 * บันทึกการตรวจสอบทั้งชุด (การตรวจสอบหลัก, จุดวัด, ไฟล์แนบ) ในธุรกรรมเดียว
 */
const saveCompleteMeasurement = async (measurementData, fileUploads = []) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // แปลงค่า shift ที่อาจจะเป็นคำเต็มให้เป็นตัวอักษรเดียว
    const shiftCode = (() => {
      if (measurementData.shift && measurementData.shift.length > 1) {
        switch(measurementData.shift.toLowerCase()) {
          case 'morning': return 'M';
          case 'afternoon': return 'A';
          case 'evening': return 'E';
          case 'night': return 'N';
          default: return measurementData.shift.charAt(0).toUpperCase();
        }
      }
      return measurementData.shift;
    })();
    
    // 1. บันทึกข้อมูลหลัก
    const insertInspectionQuery = `
      INSERT INTO public.quality_inspections (
        machine_id, machine_model_id, employee_id, 
        lead_employee_id, work_order, barcode_unit, 
        inspection_date, shift, overall_result, remarks
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9)
      RETURNING id
    `;
    
    const inspectionValues = [
      measurementData.machine_id,
      measurementData.machine_model_id,
      measurementData.employee_id,
      measurementData.lead_employee_id,
      measurementData.work_order,
      measurementData.barcode_unit,
      shiftCode,
      measurementData.overall_result,
      measurementData.remarks
    ];
    
    const inspectionResult = await client.query(insertInspectionQuery, inspectionValues);
    const inspectionId = inspectionResult.rows[0].id;
    
    // บันทึกข้อมูลรายการตรวจสอบ
    const insertItemQuery = `
      INSERT INTO quality_inspection_items (
        inspection_id, quality_item_id, standard_value, tolerance, unit
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const itemValues = [
      inspectionId,
      measurementData.quality_item_id,
      measurementData.standard_value,
      measurementData.tolerance,
      measurementData.unit
    ];
    
    const itemResult = await client.query(insertItemQuery, itemValues);
    const inspectionItemId = itemResult.rows[0].id;
    
    // 2. บันทึกข้อมูลจุดวัด
    if (!measurementData.points || measurementData.points.length === 0) {
      throw new Error("No measurement points provided");
    }
    
    const pointIds = [];
    
    for (const point of measurementData.points) {
      // หาไฟล์ที่เกี่ยวข้องกับจุดวัดนี้ (ถ้ามี)
      const relatedFile = fileUploads.find(f => f.pointNumber === point.point_number);
      const imageUrl = relatedFile ? relatedFile.path : null;
      
      const insertPointQuery = `
        INSERT INTO quality_inspection_measurements (
          inspection_item_id, point_number, measured_value, status, issue_detail, image_url
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      
      const pointValues = [
        inspectionItemId,
        point.point_number,
        point.measured_value,
        point.status,
        point.issue_detail || null,
        imageUrl
      ];
      
      const pointResult = await client.query(insertPointQuery, pointValues);
      
      pointIds.push({
        pointId: pointResult.rows[0].id,
        pointNumber: point.point_number
      });
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      id: inspectionId
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  saveQualityMeasurement,
  saveMeasurementPoint,
  saveMeasurementAttachment,
  getQualityMeasurementById,
  getQualityMeasurementsByMachine,
  saveCompleteMeasurement,
};
