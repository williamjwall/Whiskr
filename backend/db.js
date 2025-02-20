// backend/db.js
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You might need SSL config on Render's external DB:
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
