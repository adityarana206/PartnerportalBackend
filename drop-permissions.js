const { pool } = require("./config/db");

async function dropTables() {
  try {
    console.log("🗑️  Dropping permission tables...");
    
    await pool.query("DROP TABLE IF EXISTS user_permissions CASCADE");
    console.log("✅ Dropped user_permissions");
    
    await pool.query("DROP TABLE IF EXISTS permissions CASCADE");
    console.log("✅ Dropped permissions");
    
    await pool.query("DROP TABLE IF EXISTS screens CASCADE");
    console.log("✅ Dropped screens");
    
    await pool.end();
    console.log("\n🎉 All permission tables dropped successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    await pool.end();
    process.exit(1);
  }
}

dropTables();
