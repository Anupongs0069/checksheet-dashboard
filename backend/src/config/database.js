// src/config/database.js

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// แก้ไขฟังก์ชัน testConnection สำหรับ PostgreSQL
const testConnection = async () => {
  let client;
  try {
    // ใช้ pool.connect() แทน getConnection สำหรับ PostgreSQL
    client = await pool.connect();
    await client.query('SELECT 1'); // ทดสอบ query
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

// ทดสอบการเชื่อมต่อ
testConnection().catch(console.error);

// เพิ่ม error handler สำหรับ pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;