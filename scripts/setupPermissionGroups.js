const { pool } = require("../config/db");
const fs = require("fs");
const path = require("path");

async function createPermissionGroups() {
  const client = await pool.connect();
  try {
    console.log("🔧 Creating permission groups tables...");

    const sqlPath = path.join(__dirname, "createPermissionGroups.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    await client.query(sql);

    console.log("✅ Tables created successfully!");
    console.log("   - permission_groups");
    console.log("   - group_permissions");
    console.log("   - user_group_assignments");
    console.log("\n✅ Default permission groups inserted!");
    console.log("\n🎉 Permission groups setup complete!");
  } catch (error) {
    console.error("❌ Error creating permission groups:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createPermissionGroups()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createPermissionGroups;
