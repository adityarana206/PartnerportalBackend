require("dotenv").config();
const { pool } = require("../config/db");

async function addAddressCodeColumn() {
  try {
    console.log("Adding address_code column to partner_location_links...\n");

    await pool.query(`
      ALTER TABLE partner_location_links 
      ADD COLUMN IF NOT EXISTS address_code VARCHAR(100);
    `);

    console.log("✅ address_code column added successfully!");
    
    // Verify the column was added
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'partner_location_links' 
      ORDER BY ordinal_position
    `);
    
    console.log("\nCurrent columns:", result.rows.map(r => r.column_name).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addAddressCodeColumn();
