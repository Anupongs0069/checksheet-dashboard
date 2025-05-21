// ./src/services/StatusMachineService.js

const db = require("../config/database");

const getDateRangeFromTimeRange = (timeRange) => {
  const now = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case "today":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );
      break;
    case "week":
      // วันอาทิตย์ของสัปดาห์นี้
      const firstDay = new Date(now);
      const day = now.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ...
      firstDay.setDate(now.getDate() - day); // ย้อนกลับไปวันอาทิตย์

      startDate = new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate(),
        0,
        0,
        0
      );
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      // ค่าเริ่มต้นใช้วันนี้
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

class StatusMachineService {
  static async getAllMachines() {
    const query = `
      SELECT 
        m.id as machine_id,
        m.machine_name,
        m.machine_full_name,
        m.machine_number,
        m.series_number,
        m.model,
        m.customer,
        m.product,
        ms.status,
        ms.source as status_source,
        (
          SELECT MAX(md.start_time)
          FROM machine_downtime md
          WHERE md.machine_id = m.id
        ) as last_downtime,
        (
          SELECT sih.status
          FROM safety_inspection_history sih
          WHERE sih.machine_id = m.id
          ORDER BY sih.checked_at DESC LIMIT 1
        ) as safety_status,
        (
          SELECT sih.checked_at
          FROM safety_inspection_history sih
          WHERE sih.machine_id = m.id
          ORDER BY sih.checked_at DESC LIMIT 1
        ) as last_safety_check,
        (
          SELECT sih.shift
          FROM safety_inspection_history sih
          WHERE sih.machine_id = m.id
          ORDER BY sih.checked_at DESC LIMIT 1
        ) as last_safety_check_shift
      FROM machines m
      LEFT JOIN machine_status ms ON m.id = ms.machine_id
      ORDER BY m.machine_name
    `;

    const result = await db.query(query);
    return result.rows;
  }

  static async getMachineById(id) {
    const query = `
      SELECT 
        m.id as machine_id,
        m.machine_name,
        m.machine_full_name,
        m.machine_number,
        m.series_number,
        m.model,
        m.customer,
        m.product,
        m.image_path,
        ms.status,
        ms.source as status_source,
        ms.updated_at as status_updated_at,
        (
          SELECT MAX(md.start_time)
          FROM machine_downtime md
          WHERE md.machine_id = m.id
        ) as last_downtime
      FROM machines m
      LEFT JOIN machine_status ms ON m.id = ms.machine_id
      WHERE m.id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getDowntimeRecords({ machineId, limit, startDate, endDate }) {
    let params = [];
    let whereClause = "";

    if (machineId) {
      params.push(machineId);
      whereClause += ` AND md.machine_id = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      whereClause += ` AND md.start_time >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      whereClause += ` AND (md.end_time <= $${params.length} OR md.end_time IS NULL)`;
    }

    const query = `
      SELECT 
        md.id,
        md.machine_id,
        m.machine_name,
        md.start_time,
        md.end_time,
        md.problem_description,
        md.solution_description,
        md.reason_id,
        dr.reason,
        dr.category,
        md.reported_by,
        md.technician_id,
        md.status,
        md.priority,
        md.downtime_minutes,
        md.work_order,
        md.shift,
        md.image_before_repair,
        md.image_after_repair
      FROM machine_downtime md
      JOIN machines m ON md.machine_id = m.id
      LEFT JOIN downtime_reasons dr ON md.reason_id = dr.id
      WHERE 1=1 ${whereClause}
      ORDER BY md.start_time DESC
      LIMIT $${params.length + 1}
    `;

    params.push(limit);
    const result = await db.query(query, params);
    return result.rows;
  }

  static async createDowntimeRecord(downtimeData) {
    const {
      machine_id,
      problem_description,
      reason_id,
      reported_by,
      technician_id,
      start_time,
      priority,
      status,
    } = downtimeData;

    const query = `
      INSERT INTO machine_downtime (
        machine_id, 
        problem_description, 
        reason_id, 
        reported_by, 
        technician_id, 
        start_time, 
        priority,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      machine_id,
      problem_description,
      reason_id || null,
      reported_by,
      technician_id || null,
      start_time,
      priority,
      status,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateDowntimeRecord(id, updateData) {
    const {
      end_time,
      solution_description,
      reason_id,
      technician_id,
      status,
      downtime_minutes,
      priority,
    } = updateData;

    const checkQuery = "SELECT id FROM machine_downtime WHERE id = $1";
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return null;
    }

    let updateColumns = [];
    let values = [id];
    let paramCount = 1;

    if (end_time !== undefined) {
      updateColumns.push(`end_time = $${++paramCount}`);
      values.push(end_time);

      if (downtime_minutes === undefined) {
        updateColumns.push(
          `downtime_minutes = EXTRACT(EPOCH FROM ($${paramCount} - start_time)) / 60`
        );
      }
    }

    if (solution_description !== undefined) {
      updateColumns.push(`solution_description = $${++paramCount}`);
      values.push(solution_description);
    }

    if (reason_id !== undefined) {
      updateColumns.push(`reason_id = $${++paramCount}`);
      values.push(reason_id);
    }

    if (technician_id !== undefined) {
      updateColumns.push(`technician_id = $${++paramCount}`);
      values.push(technician_id);
    }

    if (status !== undefined) {
      updateColumns.push(`status = $${++paramCount}`);
      values.push(status);
    }

    if (downtime_minutes !== undefined) {
      updateColumns.push(`downtime_minutes = $${++paramCount}`);
      values.push(downtime_minutes);
    }

    if (priority !== undefined) {
      updateColumns.push(`priority = $${++paramCount}`);
      values.push(priority);
    }

    updateColumns.push(`updated_at = NOW()`);

    if (updateColumns.length === 0) {
      return await this.getDowntimeRecordById(id);
    }

    const query = `
      UPDATE machine_downtime
      SET ${updateColumns.join(", ")}
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getDowntimeRecordById(id) {
    const query = `
      SELECT *
      FROM machine_downtime
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getDashboardSummary(timeRange) {
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

    const unavailableMachinesQuery = `
      SELECT COUNT(DISTINCT machine_id) as count
      FROM machine_status
      WHERE status != 'running'
    `;

    // คำนวณจำนวนปัญหาที่กำลังแก้ไขอยู่ (active หรือ maintenance)
    const activeIssuesQuery = `
      SELECT COUNT(*) as count
      FROM machine_status
      WHERE status IN ('active', 'maintenance')
    `;

    // คำนวณจำนวนปัญหาเฉพาะในสถานะ active
    const activeOnlyIssuesQuery = `
      SELECT COUNT(*) as count
      FROM machine_status
      WHERE status = 'active'
    `;

    // คำนวณจำนวนปัญหาเฉพาะในสถานะ maintenance
    const maintenanceIssuesQuery = `
      SELECT COUNT(*) as count
      FROM machine_status
      WHERE status = 'maintenance'
    `;

    // คำนวณจำนวนปัญหาที่แก้ไขในวันนี้ (จากการเปลี่ยนสถานะเป็น running/idle หลังจากเป็น active/maintenance)
    const resolvedTodayQuery = `
      SELECT COUNT(*) as count
      FROM machine_status_log
      WHERE DATE(changed_at) = CURRENT_DATE
      AND old_status IN ('active', 'maintenance')
      AND new_status IN ('running', 'idle')
    `;

    // คำนวณ total downtime จาก log โดยดูช่วงเวลาระหว่าง
    // เปลี่ยนจาก running เป็น active/maintenance/idle และเปลี่ยนกลับเป็น running
    const totalDowntimeQuery = `
      WITH status_changes AS (
        SELECT 
          machine_id,
          changed_at,
          new_status,
          old_status,
          LEAD(changed_at) OVER (PARTITION BY machine_id ORDER BY changed_at) as next_change
        FROM machine_status_log
        WHERE changed_at BETWEEN $1 AND $2
      )
      SELECT 
        SUM(
          EXTRACT(EPOCH FROM (next_change - changed_at)) / 3600
        ) as total_hours
      FROM status_changes
      WHERE new_status IN ('active', 'maintenance', 'idle', 'waiting_for_customer', 'waiting_leader_approval')
      AND next_change IS NOT NULL
      AND old_status = 'running'
    `;

    // คำนวณเวลาเฉลี่ยในการแก้ไขปัญหา
    const avgResolutionTimeQuery = `
      WITH resolution_times AS (
        SELECT 
          l1.machine_id,
          l1.changed_at as start_time,
          MIN(l2.changed_at) as end_time
        FROM machine_status_log l1
        JOIN machine_status_log l2 ON l1.machine_id = l2.machine_id
        WHERE l1.new_status IN ('active', 'maintenance')
        AND l2.new_status = 'running'
        AND l2.changed_at > l1.changed_at
        AND l1.changed_at BETWEEN $1 AND $2
        GROUP BY l1.machine_id, l1.changed_at
      )
      SELECT 
        AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) as avg_minutes
      FROM resolution_times
    `;

    const activeIssuesDetailQuery = `
SELECT 
  ms.id as machine_status_id,
  ms.machine_id,
  m.machine_name as machineName,
  m.machine_number,
  ms.status,
  
  COALESCE(
    md.id, 
    (SELECT id FROM machine_downtime 
     WHERE machine_id = ms.machine_id 
     ORDER BY created_at DESC LIMIT 1)
  ) as machine_downtime_id,
  
  md.problem_description as issue,
  md.problem_type,
  (
    SELECT MAX(changed_at)
    FROM machine_status_log
    WHERE machine_id = ms.machine_id
    AND new_status = ms.status
  ) as startTime,
  COALESCE(md.priority, 'medium') as priority,
  md.technician_id as assignedTo,
  EXTRACT(EPOCH FROM (NOW() - (
    SELECT MAX(changed_at)
    FROM machine_status_log
    WHERE machine_id = ms.machine_id
    AND new_status = ms.status
  ))) / 3600 as downtime
FROM machine_status ms
JOIN machines m ON ms.machine_id = m.id
LEFT JOIN machine_downtime md ON ms.source_id = md.id
WHERE ms.status IN ('active', 'maintenance')
ORDER BY COALESCE(md.priority, 'medium') DESC, (
  SELECT MAX(changed_at)
  FROM machine_status_log
  WHERE machine_id = ms.machine_id
  AND new_status = ms.status
) ASC
LIMIT 10
`;

    try {
      const [
        unavailableMachinesResult,
        activeIssuesResult,
        activeOnlyIssuesResult,
        maintenanceIssuesResult,
        resolvedTodayResult,
        totalDowntimeResult,
        avgResolutionTimeResult,
        activeIssuesDetailResult,
      ] = await Promise.all([
        db.query(unavailableMachinesQuery),
        db.query(activeIssuesQuery),
        db.query(activeOnlyIssuesQuery),
        db.query(maintenanceIssuesQuery),
        db.query(resolvedTodayQuery),
        db.query(totalDowntimeQuery, [startDate, endDate]),
        db.query(avgResolutionTimeQuery, [startDate, endDate]),
        db.query(activeIssuesDetailQuery),
      ]);

      const summary = {
        totalDowntime: parseFloat(
          totalDowntimeResult.rows[0]?.total_hours || 0
        ).toFixed(1),
        activeIssues: parseInt(activeIssuesResult.rows[0]?.count || 0),
        activeOnlyIssues: parseInt(activeOnlyIssuesResult.rows[0]?.count || 0),
        maintenanceIssues: parseInt(
          maintenanceIssuesResult.rows[0]?.count || 0
        ),
        unavailableMachines: parseInt(
          unavailableMachinesResult.rows[0]?.count || 0
        ),
        resolvedToday: parseInt(resolvedTodayResult.rows[0]?.count || 0),
        avgResolutionTime: parseFloat(
          avgResolutionTimeResult.rows[0]?.avg_minutes || 0
        ).toFixed(1),
      };

      const issues = activeIssuesDetailResult.rows.map((issue) => ({
        ...issue,
        startTime: new Date(issue.starttime).toLocaleString(),
        downtime: parseFloat(issue.downtime).toFixed(1),
      }));

      return {
        summary,
        issues,
      };
    } catch (error) {
      console.error("Error in getDashboardSummary:", error);
      throw error;
    }
  }

  static async getDowntimeByReason(timeRange) {
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

    const query = `
      SELECT
        dr.id,
        dr.category,
        dr.reason,
        COUNT(md.id) as issue_count,
        SUM(
          CASE
            WHEN md.downtime_minutes IS NOT NULL THEN md.downtime_minutes / 60
            WHEN md.end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (md.end_time - md.start_time)) / 3600
            ELSE EXTRACT(EPOCH FROM (NOW() - md.start_time)) / 3600
          END
        ) as total_downtime
      FROM machine_downtime md
      JOIN downtime_reasons dr ON md.reason_id = dr.id
      WHERE md.start_time BETWEEN $1 AND $2
      GROUP BY dr.id, dr.category, dr.reason
      ORDER BY total_downtime DESC
      LIMIT 10
    `;

    const result = await db.query(query, [startDate, endDate]);

    return result.rows.map((row) => ({
      ...row,
      total_downtime: parseFloat(row.total_downtime).toFixed(1),
    }));
  }

  static async getDowntimeTimeSeries(timeRange) {
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);

    let groupByFormat;
    let selectFormat;

    if (timeRange === "today") {
      groupByFormat = `TO_CHAR(md.start_time, 'HH24')`;
      selectFormat = `TO_CHAR(md.start_time, 'HH24') as time_period`;
    } else if (timeRange === "week") {
      groupByFormat = `TO_CHAR(md.start_time, 'YYYY-MM-DD')`;
      selectFormat = `TO_CHAR(md.start_time, 'YYYY-MM-DD') as time_period`;
    } else {
      groupByFormat = `TO_CHAR(md.start_time, 'YYYY-MM-DD')`;
      selectFormat = `TO_CHAR(md.start_time, 'YYYY-MM-DD') as time_period`;
    }

    const query = `
      SELECT
        ${selectFormat},
        COUNT(md.id) as issue_count,
        SUM(
          CASE
            WHEN md.downtime_minutes IS NOT NULL THEN md.downtime_minutes / 60
            WHEN md.end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (md.end_time - md.start_time)) / 3600
            ELSE EXTRACT(EPOCH FROM (NOW() - md.start_time)) / 3600
          END
        ) as total_downtime
      FROM machine_downtime md
      WHERE md.start_time BETWEEN $1 AND $2
      GROUP BY ${groupByFormat}
      ORDER BY ${groupByFormat}
    `;

    const result = await db.query(query, [startDate, endDate]);

    return result.rows.map((row) => ({
      ...row,
      total_downtime: parseFloat(row.total_downtime || 0).toFixed(1),
    }));
  }

  static async getDowntimeStatsByMachine(startDate, endDate) {
    const query = `
      SELECT
        m.id,
        m.machine_name,
        m.machine_number,
        m.model,
        COUNT(md.id) as incident_count,
        SUM(
          CASE
            WHEN md.downtime_minutes IS NOT NULL THEN md.downtime_minutes
            WHEN md.end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (md.end_time - md.start_time)) / 60
            ELSE EXTRACT(EPOCH FROM (NOW() - md.start_time)) / 60
          END
        ) as total_downtime_minutes,
        AVG(
          CASE
            WHEN md.downtime_minutes IS NOT NULL THEN md.downtime_minutes
            WHEN md.end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (md.end_time - md.start_time)) / 60
            ELSE EXTRACT(EPOCH FROM (NOW() - md.start_time)) / 60
          END
        ) as avg_downtime_minutes
      FROM machines m
      LEFT JOIN machine_downtime md ON m.id = md.machine_id
        AND md.start_time BETWEEN $1 AND $2
      GROUP BY m.id, m.machine_name, m.machine_number, m.model
      ORDER BY total_downtime_minutes DESC
    `;

    const result = await db.query(query, [startDate, endDate]);

    return result.rows.map((row) => ({
      ...row,
      total_downtime_minutes: Math.round(
        parseFloat(row.total_downtime_minutes || 0)
      ),
      avg_downtime_minutes: Math.round(
        parseFloat(row.avg_downtime_minutes || 0)
      ),
    }));
  }

  static async getTopDowntimeReasons(startDate, endDate, limit) {
    const query = `
      SELECT
        dr.id,
        dr.category,
        dr.reason,
        COUNT(md.id) as issue_count,
        SUM(
          CASE
            WHEN md.downtime_minutes IS NOT NULL THEN md.downtime_minutes / 60
            WHEN md.end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (md.end_time - md.start_time)) / 3600
            ELSE EXTRACT(EPOCH FROM (NOW() - md.start_time)) / 3600
          END
        ) as total_downtime,
        AVG(
          CASE
            WHEN md.downtime_minutes IS NOT NULL THEN md.downtime_minutes / 60
            WHEN md.end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (md.end_time - md.start_time)) / 3600
            ELSE EXTRACT(EPOCH FROM (NOW() - md.start_time)) / 3600
          END
        ) as avg_downtime
      FROM downtime_reasons dr
      JOIN machine_downtime md ON dr.id = md.reason_id
      WHERE md.start_time BETWEEN $1 AND $2
      GROUP BY dr.id, dr.category, dr.reason
      ORDER BY issue_count DESC
      LIMIT $3
    `;

    const result = await db.query(query, [startDate, endDate, limit]);

    return result.rows.map((row) => ({
      ...row,
      total_downtime: parseFloat(row.total_downtime || 0).toFixed(1),
      avg_downtime: parseFloat(row.avg_downtime || 0).toFixed(1),
    }));
  }

  static async updateMachineStatus(machineId, status, updatedBy) {
    const updateQuery = `
      UPDATE machine_status
      SET status = $1, source = 'manual', updated_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE machine_id = $3
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      status,
      updatedBy || "system",
      machineId,
    ]);

    return result.rows[0];
  }

  static async getMachinesByStatus(status) {
    const statusValues = Array.isArray(status) ? status : [status];

    const query = `
      SELECT 
        m.id as machine_id,
        m.machine_name,
        m.machine_number,
        m.customer,
        m.product,
        ms.status
      FROM machines m
      LEFT JOIN machine_status ms ON m.id = ms.machine_id
      WHERE ms.status = ANY($1)
      ORDER BY m.machine_name
    `;

    const result = await db.query(query, [statusValues]);
    return result.rows;
  }

  static async getMachinesStatusDetail(statusArray = null) {
    let query = `
      SELECT 
        ms.machine_id,
        m.machine_name,
        m.machine_number,
        ms.status,
        m.customer,
        md.work_order,
        dr.category as problem_type,
        md.problem_description,
        ms.source_id
      FROM machine_status ms
      JOIN machines m ON ms.machine_id = m.id
      LEFT JOIN machine_downtime md ON ms.source_id = md.id
      LEFT JOIN downtime_reasons dr ON md.reason_id = dr.id
    `;

    let params = [];

    if (statusArray && statusArray.length > 0) {
      query += ` WHERE ms.status = ANY($1)`;
      params.push(statusArray);
    }

    query += ` ORDER BY m.machine_name`;

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = StatusMachineService;
