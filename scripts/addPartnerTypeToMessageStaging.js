const { pool, connectDB } = require("../config/db");

(async () => {
  try {
    await connectDB();
    
    console.log("Adding partner_type column to message_staging table...");
    
    await pool.query(`
      ALTER TABLE message_staging 
      ADD COLUMN IF NOT EXISTS partner_type VARCHAR(20) DEFAULT 'Vendor'
    `);
    
    console.log("✅ partner_type column added successfully");
    
    // Update existing records to have valid partner_type
    console.log("\nUpdating existing records...");
    const result = await pool.query(`
      UPDATE message_staging 
      SET partner_type = 'Vendor' 
      WHERE partner_type IS NULL OR partner_type = '' OR partner_type = ' '
    `);
    
    console.log(`✅ Updated ${result.rowCount} records`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
