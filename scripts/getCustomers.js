const { pool } = require("../config/db");

async function getCustomers() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ref_no, name, email
      FROM users 
      WHERE ref_no IN ('CUST001', 'CUST002', 'CUST003')
      ORDER BY ref_no
    `);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

getCustomers();
