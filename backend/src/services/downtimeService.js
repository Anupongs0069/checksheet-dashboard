// ./src/services/downtimeService.js

const db = require("../config/database");

class DowntimeService {

  async createDowntime(downtimeData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // สร้างบันทึกการหยุดทำงาน
      const query = `
      INSERT INTO machine_downtime (
        machine_id, problem_description, reason_id, 
        reported_by, status, priority, work_order, shift,
        start_time, problem_type
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

      const values = [
        downtimeData.machine_id,
        downtimeData.problem_description,
        downtimeData.reason_id,
        downtimeData.reported_by,
        downtimeData.status || "active",
        downtimeData.priority || "medium",
        downtimeData.work_order,
        downtimeData.shift,
        downtimeData.start_time || new Date(),
        downtimeData.problem_type  // เพิ่มฟิลด์ problem_type
      ];

      const result = await client.query(query, values);
      await client.query("COMMIT");

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateDowntime(id, downtimeData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const setStatements = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(downtimeData)) {
        if (value !== undefined && key !== "id") {
          setStatements.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      values.push(id);

      if (setStatements.length === 0) {
        throw new Error("No fields to update");
      }

      const query = `
      UPDATE machine_downtime
      SET ${setStatements.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Downtime record not found");
      }

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // ปิดเหตุการณ์การหยุดทำงาน (เมื่อเครื่องกลับมาทำงาน)
  async resolveDowntime(id, data) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const query = `
        UPDATE machine_downtime
        SET 
          end_time = $1,
          solution_description = $2,
          technician_id = $3,
          status = 'resolved',
          image_after_repair = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `;

      const values = [
        data.end_time || new Date(),
        data.solution_description,
        data.technician_id,
        data.image_after_repair,
        id,
      ];

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Downtime record not found");
      }

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // เพิ่มการดำเนินการซ่อมบำรุง
  async addMaintenanceAction(actionData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const query = `
        INSERT INTO maintenance_actions (
          downtime_id, action_description, performed_by, 
          performed_at, spare_parts_used, notes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        actionData.downtime_id,
        actionData.action_description,
        actionData.performed_by,
        actionData.performed_at || new Date(),
        actionData.spare_parts_used,
        actionData.notes,
      ];

      const result = await client.query(query, values);
      await client.query("COMMIT");

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getDowntimeById(id) {
    const client = await db.connect();
    try {
      const downtimeQuery = `
        SELECT d.*, m.machine_name, m.machine_number, m.model, r.category, r.reason
        FROM machine_downtime d
        JOIN machines m ON d.machine_id = m.id
        LEFT JOIN downtime_reasons r ON d.reason_id = r.id
        WHERE d.id = $1
      `;
      const downtimeResult = await client.query(downtimeQuery, [id]);

      if (downtimeResult.rows.length === 0) {
        return null;
      }

      const actionsQuery = `
        SELECT * FROM maintenance_actions
        WHERE downtime_id = $1
        ORDER BY performed_at
      `;
      const actionsResult = await client.query(actionsQuery, [id]);

      const downtime = downtimeResult.rows[0];
      downtime.maintenance_actions = actionsResult.rows;

      return downtime;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async getDowntimeList(filters = {}) {
    const client = await db.connect();
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;

      if (filters.machine_id) {
        conditions.push(`d.machine_id = $${paramIndex++}`);
        values.push(filters.machine_id);
      }

      if (filters.status) {
        conditions.push(`d.status = $${paramIndex++}`);
        values.push(filters.status);
      }

      if (filters.start_date) {
        conditions.push(`d.start_time >= $${paramIndex++}`);
        values.push(filters.start_date);
      }

      if (filters.end_date) {
        conditions.push(`d.start_time <= $${paramIndex++}`);
        values.push(filters.end_date);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const orderBy = filters.sort_by
        ? `ORDER BY ${filters.sort_by} ${filters.sort_dir || "DESC"}`
        : "ORDER BY d.start_time DESC";

      const query = `
        SELECT 
          d.id, d.machine_id, d.problem_description, d.status, 
          d.start_time, d.end_time, d.downtime_minutes,
          d.priority, d.work_order, d.shift, d.problem_type,
          m.machine_name, m.machine_number, m.model,
          r.category, r.reason
        FROM machine_downtime d
        JOIN machines m ON d.machine_id = m.id
        LEFT JOIN downtime_reasons r ON d.reason_id = r.id
        ${whereClause}
        ${orderBy}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      const limit = filters.limit || 50;
      const offset = filters.page ? (filters.page - 1) * limit : 0;
      values.push(limit, offset);

      const result = await client.query(query, values);

      const countQuery = `
        SELECT COUNT(*) as total
        FROM machine_downtime d
        JOIN machines m ON d.machine_id = m.id
        LEFT JOIN downtime_reasons r ON d.reason_id = r.id
        ${whereClause}
      `;

      const countResult = await client.query(
        countQuery,
        conditions.length > 0 ? values.slice(0, -2) : []
      );
      const total = parseInt(countResult.rows[0].total);

      return {
        data: result.rows,
        pagination: {
          total,
          page: filters.page || 1,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // เพิ่มสาเหตุการหยุดทำงานใหม่
  async createDowntimeReason(reasonData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const query = `
        INSERT INTO downtime_reasons (
          category, reason, is_planned, description
        ) 
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [
        reasonData.category,
        reasonData.reason,
        reasonData.is_planned || false,
        reasonData.description,
      ];

      const result = await client.query(query, values);
      await client.query("COMMIT");

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // ดึงรายการสาเหตุการหยุดทำงานทั้งหมด
  async getDowntimeReasons() {
    const client = await db.connect();
    try {
      const query = `
        SELECT * FROM downtime_reasons
        ORDER BY category, reason
      `;

      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // สถิติและรายงาน: คำนวณเวลาหยุดทำงานทั้งหมดตามเครื่อง
  async getDowntimeStatsByMachine(startDate, endDate) {
    const client = await db.connect();
    try {
      const query = `
        SELECT 
          m.id, m.machine_name, m.machine_number, m.model,
          COUNT(d.id) as incident_count,
          SUM(d.downtime_minutes) as total_downtime_minutes,
          AVG(d.downtime_minutes) as avg_downtime_minutes
        FROM machines m
        LEFT JOIN machine_downtime d ON m.id = d.machine_id
          AND d.start_time BETWEEN $1 AND $2
          AND d.status = 'resolved'
        GROUP BY m.id, m.machine_name, m.machine_number, m.model
        ORDER BY total_downtime_minutes DESC NULLS LAST
      `;

      const result = await client.query(query, [startDate, endDate]);
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  // สถิติและรายงาน: คำนวณสาเหตุการหยุดทำงานที่พบบ่อย
  async getTopDowntimeReasons(startDate, endDate, limit = 10) {
    const client = await db.connect();
    try {
      const query = `
        SELECT 
          r.id, r.category, r.reason, r.is_planned,
          COUNT(d.id) as incident_count,
          SUM(d.downtime_minutes) as total_downtime_minutes
        FROM downtime_reasons r
        JOIN machine_downtime d ON r.id = d.reason_id
          AND d.start_time BETWEEN $1 AND $2
          AND d.status = 'resolved'
        GROUP BY r.id, r.category, r.reason, r.is_planned
        ORDER BY total_downtime_minutes DESC
        LIMIT $3
      `;

      const result = await client.query(query, [startDate, endDate, limit]);
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async getDashboardSummary(timeRange) {
    const client = await db.connect();
    try {
      let startDate,
        endDate = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (timeRange) {
        case "today":
          startDate = today;
          break;
        case "week":
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate = new Date(today);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate = today;
      }

      // แก้ไขคำสั่ง SQL ให้จัดการค่า NULL
      const summaryQuery = `
        SELECT
          COALESCE(SUM(COALESCE(downtime_minutes, 0)) / 60, 0) as total_downtime,
          COUNT(CASE WHEN status = 'active' OR status = 'in_progress' THEN 1 END) as active_issues,
          COUNT(CASE WHEN status = 'resolved' AND end_time >= $1 THEN 1 END) as resolved_today,
          COALESCE(AVG(CASE WHEN status = 'resolved' THEN COALESCE(downtime_minutes, 0) / 60 ELSE NULL END), 0) as avg_resolution_time
        FROM machine_downtime
        WHERE start_time >= $2 AND start_time <= $3
      `;

      const summaryResult = await client.query(summaryQuery, [
        today,
        startDate,
        endDate,
      ]);

      // เพิ่มการตรวจสอบว่ามีข้อมูลหรือไม่
      const summary = summaryResult.rows[0] || {
        total_downtime: 0,
        active_issues: 0,
        resolved_today: 0,
        avg_resolution_time: 0
      };

      // ปรับคำสั่ง query ให้ปลอดภัยมากขึ้น
      const issuesQuery = `
        SELECT
          d.id,
          m.machine_name as machine_name,
          d.problem_description as issue,
          d.priority,
          d.start_time,
          COALESCE(d.downtime_minutes, 0) / 60 as downtime,
          d.technician_id as assigned_to,
          d.status
        FROM machine_downtime d
        LEFT JOIN machines m ON d.machine_id = m.id
        WHERE (d.status = 'active' OR d.status = 'in_progress')
          AND d.start_time >= $1 AND d.start_time <= $2
        ORDER BY d.priority DESC, d.start_time ASC
      `;

      const issuesResult = await client.query(issuesQuery, [
        startDate,
        endDate,
      ]);

      // ปรับการแปลงข้อมูลให้ปลอดภัยมากขึ้น
      const formattedIssues = issuesResult.rows.map((issue) => ({
        id: issue.id,
        machineName: issue.machine_name || 'Unknown Machine',
        status: issue.status,
        issue: issue.issue,
        startTime: new Date(issue.start_time).toLocaleString(),
        priority: issue.priority,
        assignedTo: issue.assigned_to,
        downtime: issue.downtime ? Number(issue.downtime).toFixed(1) : '0.0',
      }));

      return {
        summary: {
          totalDowntime: parseFloat(Number(summary.total_downtime || 0).toFixed(1)),
          activeIssues: parseInt(summary.active_issues || 0),
          resolvedToday: parseInt(summary.resolved_today || 0),
          avgResolutionTime: parseFloat(Number(summary.avg_resolution_time || 0).toFixed(1)),
        },
        issues: formattedIssues,
      };
    } catch (error) {
      console.error("Error in getDashboardSummary:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getDowntimeTimeSeries(timeRange) {
    const client = await db.connect();
    try {
      let startDate,
        endDate = new Date();
      let interval, format;

      switch (timeRange) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          interval = "hour";
          format = "HH24";
          break;
        case "week":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          interval = "day";
          format = "YYYY-MM-DD";
          break;
        case "month":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          interval = "day";
          format = "YYYY-MM-DD";
          break;
        default:
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          interval = "hour";
          format = "HH24";
      }

      const query = `
        SELECT
          TO_CHAR(date_trunc('${interval}', start_time), '${format}') as time_period,
          COUNT(*) as issue_count,
          COALESCE(SUM(downtime_minutes) / 60, 0) as total_downtime
        FROM machine_downtime
        WHERE start_time >= $1 AND start_time <= $2
        GROUP BY time_period
        ORDER BY time_period
      `;

      const result = await client.query(query, [startDate, endDate]);

      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async getDowntimeByReason(timeRange) {
    const client = await db.connect();
    try {
      // กำหนดช่วงเวลาตาม timeRange
      let startDate,
        endDate = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (timeRange) {
        case "today":
          startDate = today;
          break;
        case "week":
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate = new Date(today);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        default:
          startDate = today;
      }

      const query = `
        SELECT
          r.category,
          r.reason,
          COUNT(*) as issue_count,
          COALESCE(SUM(d.downtime_minutes) / 60, 0) as total_downtime
        FROM machine_downtime d
        JOIN downtime_reasons r ON d.reason_id = r.id
        WHERE d.start_time >= $1 AND d.start_time <= $2
        GROUP BY r.category, r.reason
        ORDER BY total_downtime DESC
      `;

      const result = await client.query(query, [startDate, endDate]);

      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async updateMachineStatus(machineId, newStatus) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");


      const machineCheckQuery = "SELECT * FROM machines WHERE id = $1";
      const machineResult = await client.query(machineCheckQuery, [machineId]);

      if (machineResult.rows.length === 0) {
        throw new Error("Machine not found");
      }


      if (newStatus === 'running') {

        const activeDowntimeQuery = `
          SELECT id FROM machine_downtime 
          WHERE machine_id = $1 AND (status = 'active' OR status = 'in_progress')
          ORDER BY start_time DESC LIMIT 1
        `;

        const downtimeResult = await client.query(activeDowntimeQuery, [machineId]);

        if (downtimeResult.rows.length > 0) {
          const downtimeId = downtimeResult.rows[0].id;

          await client.query(`
            UPDATE machine_downtime
            SET status = 'resolved', end_time = NOW(),
                solution_description = 'Status changed to running from UI',
                updated_at = NOW()
            WHERE id = $1
          `, [downtimeId]);
        }
      } else {

        await client.query(`
          INSERT INTO machine_downtime (
            machine_id, problem_description, status, start_time
          ) VALUES ($1, $2, $3, NOW())
        `, [
          machineId,
          `Status changed to ${newStatus}`,
          newStatus
        ]);
      }

      await client.query("COMMIT");
      return { machine_id: machineId, status: newStatus };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }


}

module.exports = new DowntimeService();
