require("dotenv").config();
const { pool } = require("../config/db");

async function addVendorNameColumn() {
  try {
    console.log("Adding vendor_name column to users table...\n");

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);
    `);

    console.log("✅ vendor_name column added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addVendorNameColumn();
