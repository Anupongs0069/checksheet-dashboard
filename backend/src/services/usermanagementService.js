// src/services/usermanagementService.js

const bcrypt = require("bcryptjs");
const db = require("../config/database");

const createUser = async (userData) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const query = `
      INSERT INTO users (
        employee_id, 
        password_hash, 
        role, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        created_at, 
        updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      userData.employee_id,
      hashedPassword,
      userData.role,
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.phone_number
    ];

    const result = await client.query(query, values);
    await client.query("COMMIT");

    const user = result.rows[0];
    delete user.password_hash;

    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteUser = async (employeeId) => {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        'DELETE FROM "users" WHERE employee_id = $1 RETURNING *',
        [employeeId]
      );
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };
  
  const updateProfile = async (userData) => {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        'UPDATE "users" SET first_name = $1, last_name = $2, email = $3, phone_number = $4, updated_at = CURRENT_TIMESTAMP WHERE employee_id = $5 RETURNING *',
        [
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.phone_number,
          userData.employee_id
        ]
      );
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };
  
  const getProfile = async (employeeId) => {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        'SELECT employee_id, role, first_name, last_name, email, phone_number FROM "users" WHERE employee_id = $1',
        [employeeId]
      );
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };
  
  module.exports = {
    createUser,
    deleteUser,
    updateProfile,
    getProfile
  };