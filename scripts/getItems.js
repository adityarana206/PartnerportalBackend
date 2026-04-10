const { pool } = require("../config/db");

async function getItems() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT partner_portal_no, item_name, description FROM item_requests WHERE status = 'Approved' LIMIT 20");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

getItems();
