// ./src/services/checklistService.js

const pool = require("../config/database");

class ChecklistService {
  // Checklist Groups
  async getAllChecklistGroups() {
    const result = await pool.query(
      "SELECT * FROM checklist_groups ORDER BY id"
    );
    return result.rows;
  }

  async getChecklistGroupById(id) {
    const result = await pool.query(
      "SELECT * FROM checklist_groups WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  async createChecklistGroup(data) {
    const { name, thai_name } = data;
    const result = await pool.query(
      "INSERT INTO checklist_groups (name, thai_name) VALUES ($1, $2) RETURNING *",
      [name, thai_name]
    );
    return result.rows[0];
  }

  async updateChecklistGroup(id, data) {
    const { name, thai_name } = data;
    const result = await pool.query(
      "UPDATE checklist_groups SET name = $1, thai_name = $2 WHERE id = $3 RETURNING *",
      [name, thai_name, id]
    );
    return result.rows[0];
  }


  async deleteChecklistGroup(id) {
    const result = await pool.query(
      "DELETE FROM checklist_groups WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Model Checklist Items
  async getAllModelChecklistItems() {
    const result = await pool.query(`
      SELECT mci.*, cg.name as group_name, cg.thai_name as group_thai_name 
      FROM model_checklist_items mci 
      LEFT JOIN checklist_groups cg ON mci.group_id = cg.id 
      ORDER BY mci.id
    `);
    return result.rows;
  }

  async getModelChecklistItemById(id) {
    const result = await pool.query(
      `SELECT mci.*, cg.name as group_name, cg.thai_name as group_thai_name 
       FROM model_checklist_items mci 
       LEFT JOIN checklist_groups cg ON mci.group_id = cg.id 
       WHERE mci.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async createModelChecklistItem(data) {
    const {
      group_id,
      machine_name,
      model,
      item_name,
      item_thai_name,
      frequency,
    } = data;

    const result = await pool.query(
      `INSERT INTO model_checklist_items 
       (group_id, machine_name, model, item_name, item_thai_name, frequency) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [group_id, machine_name, model, item_name, item_thai_name, frequency]
    );
    return result.rows[0];
  }

  async updateModelChecklistItem(id, data) {
    const {
      group_id,
      machine_name,
      model,
      item_name,
      item_thai_name,
      frequency,
    } = data;

    const result = await pool.query(
      `UPDATE model_checklist_items 
       SET group_id = $1, machine_name = $2, model = $3, 
           item_name = $4, item_thai_name = $5, frequency = $6 
       WHERE id = $7 
       RETURNING *`,
      [group_id, machine_name, model, item_name, item_thai_name, frequency, id]
    );
    return result.rows[0];
  }

  async deleteModelChecklistItem(id) {
    const result = await pool.query(
      "DELETE FROM model_checklist_items WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Inspection History
  async createInspectionHistory(data) {
    const {
      machine_id,
      checklist_item_id,
      user_id,
      machine_name,
      machine_no,
      model,
      customer,
      family,
      status,
      issue_detail,
    } = data;

    const result = await pool.query(
      `INSERT INTO inspection_history 
       (machine_id, checklist_item_id, user_id, machine_name, machine_no, 
        model, customer, family, status, issue_detail) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        machine_id,
        checklist_item_id,
        user_id,
        machine_name,
        machine_no,
        model,
        customer,
        family,
        status,
        issue_detail,
      ]
    );
    return result.rows[0];
  }

  async getInspectionHistory(filters = {}) {
    let query = `
      SELECT ih.*, 
             u.first_name, u.last_name,
             mci.item_name, mci.item_thai_name, mci.frequency
      FROM inspection_history ih
      LEFT JOIN users u ON ih.user_id = u.employee_id
      LEFT JOIN model_checklist_items mci ON ih.checklist_item_id = mci.id
      WHERE 1=1
    `;
    const values = [];
    let valueIndex = 1;

    if (filters.machine_id) {
      query += ` AND ih.machine_id = $${valueIndex}`;
      values.push(filters.machine_id);
      valueIndex++;
    }

    if (filters.user_id) {
      query += ` AND ih.user_id = $${valueIndex}`;
      values.push(filters.user_id);
      valueIndex++;
    }

    if (filters.status) {
      query += ` AND ih.status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.start_date) {
      query += ` AND ih.checked_at >= $${valueIndex}`;
      values.push(filters.start_date);
      valueIndex++;
    }

    if (filters.end_date) {
      query += ` AND ih.checked_at <= $${valueIndex}`;
      values.push(filters.end_date);
      valueIndex++;
    }

    query += " ORDER BY ih.checked_at DESC";

    const result = await pool.query(query, values);
    return result.rows;
  }

  
async getChecklistByFrequency(machineName, model, params = {}) {
  try {
    const { is_daily, is_weekly, is_monthly, is_quarterly, is_6_months, is_yearly } = params;
    
    return this.getChecklistByFrequencyFlags(
      machineName, 
      model, 
      {
        is_daily: is_daily === 'true' || is_daily === true,
        is_weekly: is_weekly === 'true' || is_weekly === true,
        is_monthly: is_monthly === 'true' || is_monthly === true,
        is_quarterly: is_quarterly === 'true' || is_quarterly === true,
        is_6_months: is_6_months === 'true' || is_6_months === true,
        is_yearly: is_yearly === 'true' || is_yearly === true
      }
    );
  } catch (error) {
    console.error("Error in getChecklistByFrequency:", error);
    throw error;
  }
}

// เพิ่มฟังก์ชันใหม่ getChecklistByFrequencyFlags
async getChecklistByFrequencyFlags(machineName, model, { is_daily, is_weekly, is_monthly, is_quarterly, is_6_months, is_yearly }) {
  try {
    console.log("Input Parameters:", { machineName, model, is_daily, is_weekly, is_monthly, is_quarterly, is_6_months, is_yearly });
    
    let frequencyConditions = [];
    
    if (is_daily) {
      frequencyConditions.push(`mci.frequency = 'daily'`);
    }
    
    if (is_weekly) {
      frequencyConditions.push(`mci.frequency = 'weekly'`);
    }
    
    if (is_monthly) {
      frequencyConditions.push(`mci.frequency = 'monthly'`);
    }
    
    if (is_quarterly) {
      frequencyConditions.push(`mci.frequency = 'quarterly'`);
    }
    
    if (is_6_months) {
      frequencyConditions.push(`mci.frequency = '6_months'`);
    }
    
    if (is_yearly) {
      frequencyConditions.push(`mci.frequency = 'yearly'`);
    }

    if (frequencyConditions.length === 0) {
      frequencyConditions.push(`mci.frequency = 'daily'`);
    }

    const query = `
      SELECT 
        mm.machine_name,
        mm.model,
        cg.id as checklist_group_id,
        cg.name AS checklist_group_name,
        cg.thai_name AS checklist_group_thai_name,
        mci.id,
        mci.item_name,
        mci.item_thai_name,
        mci.frequency
      FROM public.machine_models mm
      INNER JOIN public.model_checklist_items mci ON mm.id = mci.machine_model_id
      INNER JOIN public.checklist_groups cg ON mci.group_id = cg.id
      WHERE mm.machine_name = $1
      AND mm.model = $2
      AND (${frequencyConditions.join(' OR ')})
      ORDER BY 
        cg.id,
        CASE mci.frequency
          WHEN 'daily' THEN 1
          WHEN 'weekly' THEN 2
          WHEN 'monthly' THEN 3
          WHEN 'quarterly' THEN 4
          WHEN '6_months' THEN 5
          WHEN 'yearly' THEN 6
        END,
        cg.name,
        mci.item_name;
    `;

    const params = [machineName, model];
    const result = await pool.query(query, params);

    // จัดกลุ่มข้อมูลเหมือนกับในฟังก์ชันเดิม
    const groupedItems = result.rows.reduce((acc, item) => {
      const groupKey = item.group_id || item.checklist_group_name;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          group: {
            id: item.group_id,
            name: item.checklist_group_name,
            thai_name: item.checklist_group_thai_name,
          },
          items: [],
        };
      }

      acc[groupKey].items.push({
        id: item.id,
        item_name: item.item_name,
        item_thai_name: item.item_thai_name,
        frequency: item.frequency,
      });

      return acc;
    }, {});

    const formattedResult = Object.values(groupedItems);
    console.log("Formatted Result:", formattedResult);

    return {
      total: result.rows.length,
      groups: formattedResult,
    };
  } catch (error) {
    console.error("Error in getChecklistByFrequencyFlags:", error);
    throw error;
  }
}
}

module.exports = new ChecklistService();
