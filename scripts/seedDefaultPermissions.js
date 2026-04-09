const { pool } = require("../config/db");

async function seedDefaultPermissions() {
  const client = await pool.connect();
  try {
    console.log("🔄 Seeding default permissions...");

    // Get all screens
    const screensResult = await client.query("SELECT id, screen_code FROM screens");
    const screens = screensResult.rows;

    console.log(`📊 Found ${screens.length} screens`);

    // Define default permissions for each role
    const rolePermissions = {
      super_admin: { read: true, write: true, modify: true, delete: true },
      vendor_admin: { read: true, write: true, modify: true, delete: false },
      vendor: { read: true, write: true, modify: false, delete: false },
      customer_admin: { read: true, write: true, modify: true, delete: false },
      customer: { read: true, write: false, modify: false, delete: false },
    };

    let insertedCount = 0;

    for (const role of Object.keys(rolePermissions)) {
      const perms = rolePermissions[role];
      
      for (const screen of screens) {
        const query = `
          INSERT INTO permissions (screen_id, role, can_read, can_write, can_modify, can_delete)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (screen_id, role) DO NOTHING
        `;
        
        const result = await client.query(query, [
          screen.id,
          role,
          perms.read,
          perms.write,
          perms.modify,
          perms.delete,
        ]);
        
        if (result.rowCount > 0) {
          insertedCount++;
        }
      }
      
      console.log(`✅ Set permissions for ${role}`);
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Inserted: ${insertedCount} permission records`);
    console.log(`   📊 Total screens: ${screens.length}`);
    console.log(`   👥 Total roles: ${Object.keys(rolePermissions).length}`);
    console.log("\n🎉 Default permissions seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding permissions:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDefaultPermissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDefaultPermissions;
