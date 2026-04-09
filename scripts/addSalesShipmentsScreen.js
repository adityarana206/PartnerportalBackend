const { pool } = require("../config/db");

async function addSalesShipmentsScreen() {
  const client = await pool.connect();
  try {
    console.log("🔄 Adding Sales Shipments screen...");

    // Check if screen already exists
    const existing = await client.query(
      "SELECT id FROM screens WHERE screen_code = 'SALES_SHIPMENTS'"
    );

    if (existing.rows.length > 0) {
      console.log("⚠️  Sales Shipments screen already exists");
      return existing.rows[0];
    }

    // Insert screen
    const result = await client.query(`
      INSERT INTO screens (screen_name, screen_code, description)
      VALUES ('Sales Shipments', 'SALES_SHIPMENTS', 'Manage sales shipments and deliveries')
      RETURNING *;
    `);

    console.log("✅ Sales Shipments screen added");

    // Add default permissions for all roles
    const screenId = result.rows[0].id;
    const rolePermissions = {
      super_admin: { read: true, write: true, modify: true, delete: true },
      vendor_admin: { read: true, write: true, modify: true, delete: false },
      vendor: { read: true, write: false, modify: false, delete: false },
      customer_admin: { read: true, write: true, modify: true, delete: false },
      customer: { read: true, write: false, modify: false, delete: false },
    };

    for (const [role, perms] of Object.entries(rolePermissions)) {
      await client.query(`
        INSERT INTO permissions (screen_id, role, can_read, can_write, can_modify, can_delete)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (screen_id, role) DO NOTHING
      `, [screenId, role, perms.read, perms.write, perms.modify, perms.delete]);
    }

    console.log("✅ Default permissions added for all roles");
    console.log("🎉 Sales Shipments screen setup complete!");

    return result.rows[0];
  } catch (error) {
    console.error("❌ Error adding screen:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  addSalesShipmentsScreen()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = addSalesShipmentsScreen;
