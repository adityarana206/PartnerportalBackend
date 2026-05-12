const { pool } = require("../config/db");

(async () => {
  try {
    console.log("🔍 Verifying System Settings Setup...\n");

    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_settings'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("❌ Table 'system_settings' does not exist!");
      console.log("   Run: node scripts/createSystemSettingsTable.js");
      process.exit(1);
    }

    console.log("✅ Table 'system_settings' exists");

    // Check if data exists
    const dataCheck = await pool.query("SELECT * FROM system_settings LIMIT 1");
    
    if (dataCheck.rows.length === 0) {
      console.log("⚠️  No data in system_settings table");
      console.log("   Inserting default values...");
      
      await pool.query(`
        INSERT INTO system_settings (theme_primary, theme_secondary) 
        VALUES ('#1976d2', '#dc004e')
      `);
      
      console.log("✅ Default values inserted");
    } else {
      console.log("✅ System settings data exists:");
      console.log("   Primary Color:", dataCheck.rows[0].theme_primary);
      console.log("   Secondary Color:", dataCheck.rows[0].theme_secondary);
      console.log("   Logo URL:", dataCheck.rows[0].logo_url || "Not set");
    }

    console.log("\n✅ System Settings setup verified successfully!");
    console.log("\n📝 Next steps:");
    console.log("   1. Ensure backend is running: npm start");
    console.log("   2. Ensure frontend is running");
    console.log("   3. Login as super admin");
    console.log("   4. Navigate to System Settings");
    console.log("   5. Update theme and upload logo");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
