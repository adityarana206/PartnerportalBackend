const { pool } = require("../config/db");
const setupPermissionTables = require("./setupPermissionTables");
const setupPermissionGroups = require("./setupPermissionGroups");
const seedDefaultPermissions = require("./seedDefaultPermissions");

async function setupDatabase() {
  console.log("🚀 Starting database setup...\n");

  try {
    // Step 1: Create permission tables
    console.log("📋 Step 1: Creating permission tables...");
    await setupPermissionTables();
    console.log("✅ Permission tables created\n");

    // Step 2: Create permission groups tables
    console.log("📋 Step 2: Creating permission groups tables...");
    await setupPermissionGroups();
    console.log("✅ Permission groups tables created\n");

    // Step 3: Seed default permissions
    console.log("📋 Step 3: Seeding default permissions...");
    await seedDefaultPermissions();
    console.log("✅ Default permissions seeded\n");

    console.log("🎉 Database setup completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   ✅ Permission tables created");
    console.log("   ✅ Permission groups tables created");
    console.log("   ✅ Default permissions seeded");
    console.log("\n💡 You can now start the server!");

  } catch (error) {
    console.error("\n❌ Database setup failed:", error.message);
    console.error("\n🔍 Error details:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
