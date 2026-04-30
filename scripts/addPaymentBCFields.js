require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS description        TEXT,
        ADD COLUMN IF NOT EXISTS transaction_type   VARCHAR(100),
        ADD COLUMN IF NOT EXISTS vendor_name        VARCHAR(255),
        ADD COLUMN IF NOT EXISTS customer_name      VARCHAR(255),
        ADD COLUMN IF NOT EXISTS applies_to_doc_no  VARCHAR(100),
        ADD COLUMN IF NOT EXISTS applies_to_doc_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS open               BOOLEAN,
        ADD COLUMN IF NOT EXISTS closed             BOOLEAN;
    `);
    console.log("✅ New payment columns added (or already exist)");

    await client.query("COMMIT");
    console.log("🎉 Migration complete");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
