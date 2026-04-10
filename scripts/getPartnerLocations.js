const { pool } = require("../config/db");

async function getPartnerLocations() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT location_code, description, address_name
      FROM partner_location_links
      ORDER BY location_code
      LIMIT 10
    `);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

getPartnerLocations();
