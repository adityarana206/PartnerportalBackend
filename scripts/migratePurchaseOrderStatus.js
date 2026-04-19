const { pool } = require("../config/db");

async function migratePurchaseOrderStatus() {
  const client = await pool.connect();
  try {
    // Drop old constraint if exists, add new one
    await client.query(`
      ALTER TABLE purchase_orders
        DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
    `);
    await client.query(`
      ALTER TABLE purchase_orders
        ADD CONSTRAINT purchase_orders_status_check
          CHECK (status IN ('Released','Processed','DO'));
    `);
    await client.query(`
      ALTER TABLE purchase_orders
        ALTER COLUMN status SET DEFAULT 'Released';
    `);
    console.log("✅ purchase_orders status constraint updated: Released, Processed, DO");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migratePurchaseOrderStatus()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
