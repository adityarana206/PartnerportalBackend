const { pool } = require("../config/db");
const fs = require("fs");
const path = require("path");

async function createTables() {
  const client = await pool.connect();
  try {
    console.log("🔧 Creating permission tables...");

    // Read SQL file
    const sqlPath = path.join(__dirname, "createPermissionTables.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute SQL
    await client.query(sql);

    console.log("✅ Tables created successfully!");
    console.log("   - screens");
    console.log("   - permissions");
    console.log("   - user_permissions");
    console.log("\n✅ Default screens inserted!");
    console.log("\n🎉 Database setup complete!");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  createTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createTables;
