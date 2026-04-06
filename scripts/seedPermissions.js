const { pool } = require("../config/db");

const defaultPermissions = {
  super_admin: {
    // Super admin has all permissions on all screens
    all: { can_read: true, can_write: true, can_modify: true, can_delete: true },
  },
  vendor_admin: {
    USERS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    ITEMS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    CONTACTS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    PURCHASE_ORDERS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    PURCHASE_INVOICES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PURCHASE_RECEIPTS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PURCHASE_PRICES: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    ITEM_CATEGORIES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PAYMENTS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    UNIT_OF_MEASURES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PARTNER_LOCATIONS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    NO_SERIES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    VAT_MASTER: { can_read: true, can_write: false, can_modify: false, can_delete: false },
  },
  vendor: {
    ITEMS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    CONTACTS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PURCHASE_ORDERS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PURCHASE_INVOICES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PURCHASE_RECEIPTS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PURCHASE_PRICES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    ITEM_CATEGORIES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PAYMENTS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    UNIT_OF_MEASURES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PARTNER_LOCATIONS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
  },
  customer_admin: {
    USERS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    ITEMS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    CONTACTS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    SALES_ORDERS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    INVOICES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PAYMENTS: { can_read: true, can_write: true, can_modify: false, can_delete: false },
    PARTNER_LOCATIONS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    ITEM_CATEGORIES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    UNIT_OF_MEASURES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
  },
  customer: {
    ITEMS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    CONTACTS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    SALES_ORDERS: { can_read: true, can_write: true, can_modify: false, can_delete: false },
    INVOICES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    PAYMENTS: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    ITEM_CATEGORIES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
    UNIT_OF_MEASURES: { can_read: true, can_write: false, can_modify: false, can_delete: false },
  },
  company_admin: {
    USERS: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    ITEMS: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    CONTACTS: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    PURCHASE_ORDERS: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    SALES_ORDERS: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    INVOICES: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    PURCHASE_INVOICES: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    PURCHASE_RECEIPTS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    PURCHASE_PRICES: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    ITEM_CATEGORIES: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    PAYMENTS: { can_read: true, can_write: true, can_modify: true, can_delete: false },
    UNIT_OF_MEASURES: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    PARTNER_LOCATIONS: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    NO_SERIES: { can_read: true, can_write: true, can_modify: true, can_delete: true },
    VAT_MASTER: { can_read: true, can_write: true, can_modify: true, can_delete: true },
  },
};

async function seedPermissions() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting permission seeding...");

    // Get all screens
    const screensResult = await client.query("SELECT * FROM screens");
    const screens = screensResult.rows;

    if (screens.length === 0) {
      console.log("⚠️  No screens found. Please run the SQL schema first.");
      return;
    }

    console.log(`📋 Found ${screens.length} screens`);

    let totalInserted = 0;

    // Seed permissions for each role
    for (const [role, permissions] of Object.entries(defaultPermissions)) {
      console.log(`\n👤 Processing role: ${role}`);

      if (permissions.all) {
        // Super admin gets all permissions on all screens
        for (const screen of screens) {
          const query = `
            INSERT INTO permissions (screen_id, role, can_read, can_write, can_modify, can_delete)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (screen_id, role) DO UPDATE SET
              can_read = $3,
              can_write = $4,
              can_modify = $5,
              can_delete = $6,
              updated_at = NOW()
          `;
          await client.query(query, [
            screen.id,
            role,
            permissions.all.can_read,
            permissions.all.can_write,
            permissions.all.can_modify,
            permissions.all.can_delete,
          ]);
          totalInserted++;
        }
      } else {
        // Other roles get specific permissions
        for (const screen of screens) {
          const screenPerms = permissions[screen.screen_code];
          if (screenPerms) {
            const query = `
              INSERT INTO permissions (screen_id, role, can_read, can_write, can_modify, can_delete)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (screen_id, role) DO UPDATE SET
                can_read = $3,
                can_write = $4,
                can_modify = $5,
                can_delete = $6,
                updated_at = NOW()
            `;
            await client.query(query, [
              screen.id,
              role,
              screenPerms.can_read,
              screenPerms.can_write,
              screenPerms.can_modify,
              screenPerms.can_delete,
            ]);
            totalInserted++;
          }
        }
      }

      console.log(`   ✅ Completed ${role}`);
    }

    console.log(`\n✅ Successfully seeded ${totalInserted} permissions!`);
    console.log("🎉 Permission seeding completed!\n");
  } catch (error) {
    console.error("❌ Error seeding permissions:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedPermissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedPermissions;
