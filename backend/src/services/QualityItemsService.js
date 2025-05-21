// ./src/services/QualityItemsService.js

const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class QualityService {
  // Get quality items by machine model ID
  async getQualityItems(machineModelId, barCodeUnit = "", specLength = "") {
    try {
      console.log("Service received:", {
        machineModelId,
        barCodeUnit,
        specLength,
      });

      const params = [Number(machineModelId)];
      let query = `
        SELECT id, machine_model_id, bar_code_unit, spec_length, item_name, item_thai_name,
        standard_value, tolerance, unit, unit_count, reference_image_url
        FROM public.model_quality_items
        WHERE machine_model_id = $1
      `;

      // เพิ่มเงื่อนไขเฉพาะเมื่อมีค่าที่ไม่ใช่สตริงว่าง
      if (barCodeUnit && barCodeUnit.trim() !== "") {
        query += ` AND bar_code_unit = $${params.length + 1}`;
        params.push(barCodeUnit.trim());
      }

      if (specLength && specLength.trim() !== "") {
        query += ` AND spec_length = $${params.length + 1}`;
        params.push(specLength.trim());
      }

      query += ` ORDER BY id ASC`;

      console.log("Executing query:", query);
      console.log("With params:", params);

      const result = await pool.query(query, params);

      // ถ้าต้องการให้กรองโดยตรงในโค้ด
      let filteredRows = result.rows;
      if (barCodeUnit && specLength) {
        filteredRows = result.rows.filter(
          (row) =>
            row.bar_code_unit.trim() === barCodeUnit.trim() &&
            row.spec_length.trim() === specLength.trim()
        );
        console.log(
          `Filtered from ${result.rows.length} to ${filteredRows.length} rows`
        );
      }

      const transformedData = filteredRows.map((item) => ({
        id: item.id,
        item: item.item_name,
        thaiItem: item.item_thai_name,
        standardValue: item.standard_value,
        tolerance: item.tolerance,
        unit: item.unit,
        imageRequired: false,
        referenceImageUrl: item.reference_image_url,
        barCodeUnit: item.bar_code_unit,
        specLength: item.spec_length,
        unitCount: item.unit_count || 0,
        status: null,
        uploadedImage: null,
        issueDetail: "",
      }));

      return { success: true, data: transformedData };
    } catch (error) {
      console.error("Error fetching quality items:", error);
      return { success: false, error: error.message };
    }
  }

  // Save quality inspection - ปรับปรุงให้ใช้โครงสร้างตารางใหม่
  async saveQualityInspection(inspectionData) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

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
        measurements = [],
      } = inspectionData;

      // 1. บันทึกข้อมูลหลักลงในตาราง quality_inspections
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
        machine_id,
        machine_model_id,
        employee_id,
        lead_employee_id,
        work_order,
        barcode_unit,
        shift,
        overall_result,
        remarks,
      ];

      const inspectionResult = await client.query(
        insertInspectionQuery,
        inspectionValues
      );
      const inspectionId = inspectionResult.rows[0].id;

      // 2. บันทึกข้อมูลรายการตรวจสอบลงในตาราง quality_inspection_items
      const insertItemQuery = `
        INSERT INTO public.quality_inspection_items (
          inspection_id, quality_item_id, standard_value, tolerance, unit
        ) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const itemValues = [
        inspectionId,
        quality_item_id,
        standard_value,
        tolerance,
        unit,
      ];

      const itemResult = await client.query(insertItemQuery, itemValues);
      const inspectionItemId = itemResult.rows[0].id;

      // 3. บันทึกข้อมูลการวัดแต่ละจุดลงในตาราง quality_inspection_measurements
      if (measurements && measurements.length > 0) {
        for (const measurement of measurements) {
          const insertMeasurementQuery = `
            INSERT INTO public.quality_inspection_measurements (
              inspection_item_id, point_number, measured_value, status, issue_detail
            ) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `;

          const measurementValues = [
            inspectionItemId,
            measurement.point_number,
            measurement.value,
            measurement.status,
            measurement.issue_detail || null,
          ];

          await client.query(insertMeasurementQuery, measurementValues);
        }
      }

      await client.query("COMMIT");

      return {
        success: true,
        data: {
          inspectionId,
          inspectionItemId,
        },
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error saving quality inspection:", error);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  // บันทึกรูปภาพสำหรับจุดวัด
  async saveMeasurementImage(file, measurementId) {
    try {
      if (!file || !measurementId) {
        return { success: false, error: "File or measurement ID not provided" };
      }

      // Create directory if it doesn't exist
      const uploadDir = path.join(
        __dirname,
        "../../public/uploads/quality_measurements"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const relativePath = `quality_measurements/${fileName}`;

      // Save the file
      fs.writeFileSync(filePath, file.buffer);

      // Update measurement record with image URL
      const updateQuery = `
        UPDATE public.quality_inspection_measurements
        SET image_url = $1
        WHERE id = $2
        RETURNING id, image_url
      `;

      const result = await pool.query(updateQuery, [
        relativePath,
        measurementId,
      ]);

      return {
        success: true,
        data: {
          fileName,
          filePath: relativePath,
          fileUrl: `/uploads/${relativePath}`,
          measurementId,
          updatedRecord: result.rows[0],
        },
      };
    } catch (error) {
      console.error("Error uploading measurement image:", error);
      return { success: false, error: error.message };
    }
  }

  // Check if quality inspection exists for machine, date, shift, and work order
  async checkQualityInspectionExists(machineId, date, shift, workOrder) {
    try {
      const query = `
        SELECT id FROM public.quality_inspections
        WHERE machine_id = $1
        AND DATE(inspection_date) = $2
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
      console.error("Error checking quality inspection:", error);
      return { success: false, error: error.message };
    }
  }

  // Upload file - ไว้สำหรับการอัปโหลดไฟล์อื่นๆ ที่ไม่ใช่รูปภาพจุดวัด
  async uploadFile(file, inspectionId) {
    try {
      if (!file) {
        return { success: false, error: "No file provided" };
      }

      // Create directory if it doesn't exist
      const uploadDir = path.join(
        __dirname,
        "../../public/uploads/quality_files"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const relativePath = `quality_files/${fileName}`;

      // Save the file
      fs.writeFileSync(filePath, file.buffer);

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
      console.error("Error uploading file:", error);
      return { success: false, error: error.message };
    }
  }

  /** 
  // Get image for a reference image URL
  async getReferenceImage(imageUrl) {
    try {
      if (!imageUrl) {
        return this.getDefaultImage();
      }

      let filePath;
      if (imageUrl.startsWith("/uploads/")) {
        filePath = path.join(__dirname, "../../public", imageUrl);
      } else {
        filePath = path.join(__dirname, "../images/QualityImages", imageUrl);
      }

      if (!fs.existsSync(filePath)) {
        console.log(
          `Image not found: ${filePath}, using default image instead`
        );
        return this.getDefaultImage();
      }

      const fileContent = fs.readFileSync(filePath);
      const fileExt = path.extname(filePath).toLowerCase().substring(1);

      let contentType = "application/octet-stream";
      switch (fileExt) {
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg";
          break;
        case "png":
          contentType = "image/png";
          break;
        case "gif":
          contentType = "image/gif";
          break;
        case "webp":
          contentType = "image/webp";
          break;
      }

      return {
        success: true,
        data: {
          contentType,
          fileContent,
        },
      };
    } catch (error) {
      console.error("Error getting reference image:", error);
      return this.getDefaultImage();
    }
  }
**/

  /*
  async getDefaultImage() {
    try {
      const defaultImagePath = path.join(
        __dirname,
        "../images",
        "No Image Available.webp"
      );
      const fileContent = fs.readFileSync(defaultImagePath);

      return {
        success: true,
        data: {
          contentType: "image/webp",
          fileContent,
        },
      };
    } catch (error) {
      console.error("Error getting default image:", error);
      return {
        success: false,
        error: "Unable to get default image",
      };
    }
  }
*/

  // ดึงข้อมูลการตรวจสอบทั้งหมดพร้อมรายละเอียด
  async getQualityInspectionById(id) {
    try {
      // 1. ดึงข้อมูลหลัก
      const inspectionQuery = `
        SELECT * FROM public.quality_inspections WHERE id = $1
      `;
      const inspectionResult = await pool.query(inspectionQuery, [id]);

      if (inspectionResult.rows.length === 0) {
        return {
          success: false,
          message: "Inspection not found",
        };
      }

      const inspection = inspectionResult.rows[0];

      // 2. ดึงข้อมูลรายการตรวจสอบ
      const itemsQuery = `
        SELECT * FROM public.quality_inspection_items WHERE inspection_id = $1
      `;
      const itemsResult = await pool.query(itemsQuery, [id]);

      // 3. ดึงข้อมูลการวัด
      const items = await Promise.all(
        itemsResult.rows.map(async (item) => {
          const measurementsQuery = `
          SELECT * FROM public.quality_inspection_measurements 
          WHERE inspection_item_id = $1
          ORDER BY point_number
        `;
          const measurementsResult = await pool.query(measurementsQuery, [
            item.id,
          ]);

          // ดึงข้อมูลรายการคุณภาพ
          const qualityItemQuery = `
          SELECT * FROM public.model_quality_items WHERE id = $1
        `;
          const qualityItemResult = await pool.query(qualityItemQuery, [
            item.quality_item_id,
          ]);

          return {
            ...item,
            quality_item:
              qualityItemResult.rows.length > 0
                ? qualityItemResult.rows[0]
                : null,
            measurements: measurementsResult.rows,
          };
        })
      );

      return {
        success: true,
        data: {
          inspection,
          items,
        },
      };
    } catch (error) {
      console.error("Error getting quality inspection:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async saveFileToInspection(file, inspectionId) {
    try {
      if (!file || !inspectionId) {
        return { success: false, error: "File or inspection ID not provided" };
      }

      // บันทึกเฉพาะข้อมูลไฟล์ที่ประมวลผลแล้วลงฐานข้อมูล
      const insertQuery = `
        INSERT INTO public.quality_inspection_attachments
        (inspection_id, file_name, file_path, file_type, file_size)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const result = await pool.query(insertQuery, [
        inspectionId,
        file.originalname,
        file.path,
        file.mimetype,
        file.size,
      ]);

      return {
        success: true,
        data: {
          id: result.rows[0].id,
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          inspectionId,
        },
      };
    } catch (error) {
      console.error("Error saving file to inspection:", error);
      return { success: false, error: error.message };
    }
  }
  async getSpecOptions(machine_model_id, bar_code_unit) {
    try {
      const query = `
        SELECT 
          id, 
          machine_model_id, 
          bar_code_unit, 
          spec_length, 
          item_name, 
          item_thai_name, 
          standard_value, 
          tolerance, 
          unit, 
          unit_count, 
          reference_image_url
        FROM public.model_quality_items
        WHERE machine_model_id = $1 AND bar_code_unit = $2
        GROUP BY id, machine_model_id, bar_code_unit, spec_length
        ORDER BY spec_length
      `;

      const result = await pool.query(query, [machine_model_id, bar_code_unit]);

      const options = result.rows.map((row) => ({
        spec_length: row.spec_length,
        machine_model_id: row.machine_model_id,
        bar_code_unit: row.bar_code_unit,
      }));

      const uniqueOptions = options.filter(
        (option, index, self) =>
          index === self.findIndex((o) => o.spec_length === option.spec_length)
      );

      return uniqueOptions;
    } catch (error) {
      console.error("Error fetching spec options:", error);
      throw error;
    }
  }
}

module.exports = new QualityService();
