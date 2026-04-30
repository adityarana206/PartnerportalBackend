require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE delivery_orders
        ADD COLUMN IF NOT EXISTS bc_synced  BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS bc_error   TEXT    DEFAULT NULL;
    `);
    console.log("✅ bc_synced and bc_error columns added to delivery_orders");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
