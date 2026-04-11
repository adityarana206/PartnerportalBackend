require("dotenv").config();
const { pool } = require("../config/db");

async function addPartnerColumns() {
  try {
    console.log("Adding partner_no and partner_type columns...\n");

    await pool.query(`
      ALTER TABLE partner_location_links 
      ADD COLUMN IF NOT EXISTS partner_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS partner_no VARCHAR(100);
    `);

    console.log("✅ Columns added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addPartnerColumns();
