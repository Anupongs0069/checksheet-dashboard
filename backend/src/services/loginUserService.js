// src/services/loginUserService.js
const bcrypt = require("bcryptjs");
const db = require("../config/database");
const { generateToken } = require("../utils/jwtUtils");

const checkLogin = async (employeeId, password) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      'SELECT * FROM "users" WHERE TRIM(employee_id) = TRIM($1)',
      [employeeId]
    );

    const user = result.rows[0];
    if (!user) {
      throw new Error("Invalid employee ID or password.");
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error("Invalid employee ID or password.");
    }

    const token = generateToken({
      employee_id: user.employee_id.trim(),
      role: user.role,
    });

    await client.query(
      'UPDATE "users" SET updated_at = CURRENT_TIMESTAMP WHERE TRIM(employee_id) = TRIM($1)',
      [employeeId]
    );

    await client.query("COMMIT");

    return {
      token,
      user: {
        employee_id: user.employee_id.trim(),
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number
      }
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  checkLogin
};