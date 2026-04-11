require("dotenv").config();
const { pool } = require("../config/db");

async function fixCreatedByColumn() {
  try {
    console.log("Fixing created_by column in partner_location_links...\n");

    // Drop the column and recreate it as integer to match users.id
    await pool.query(`
      ALTER TABLE partner_location_links 
      DROP COLUMN IF EXISTS created_by;
    `);
    console.log("✅ Dropped created_by column");

    await pool.query(`
      ALTER TABLE partner_location_links 
      ADD COLUMN created_by INTEGER;
    `);
    console.log("✅ Added created_by column as INTEGER");

    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'partner_location_links' 
      AND column_name = 'created_by'
    `);
    
    console.log("\nColumn type:", result.rows[0]);
    console.log("\n✅ created_by column fixed successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixCreatedByColumn();
