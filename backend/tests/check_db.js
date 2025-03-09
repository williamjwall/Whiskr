const pool = require('../db');

async function fetchDatabaseContents() {
  try {
    // Step 1: Get all table names
    const tablesResult = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
    );
    const tables = tablesResult.rows.map(row => row.table_name);

    console.log('Tables in the database:', tables);

    // Step 2: Fetch data from each table
    for (const table of tables) {
      console.log(`\nFetching data from table: ${table}`);
      
      const result = await pool.query(`SELECT * FROM ${table};`);
      
      if (result.rows.length > 0) {
        console.table(result.rows); // Display data in a table format
      } else {
        console.log(`Table ${table} is empty.`);
      }
    }
  } catch (err) {
    console.error('Error fetching database contents:', err);
  } finally {
    pool.end(); // Close database connection
  }
}

fetchDatabaseContents();