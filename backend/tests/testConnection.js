require('dotenv').config({ path: __dirname + '/../.env' });
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // This ensures SSL is used
  keepAlive: true,
  max: 2,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB connection success:', res.rows);
  } catch (err) {
    console.error('DB connection error:', err);
  } finally {
    await pool.end();
  }
})();
