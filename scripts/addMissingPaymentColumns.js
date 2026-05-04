require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS amount_lcy          NUMERIC,
        ADD COLUMN IF NOT EXISTS remaining_amount    NUMERIC,
        ADD COLUMN IF NOT EXISTS document_type       VARCHAR(100),
        ADD COLUMN IF NOT EXISTS document_no         VARCHAR(100),
        ADD COLUMN IF NOT EXISTS posting_date        DATE,
        ADD COLUMN IF NOT EXISTS document_date       DATE,
        ADD COLUMN IF NOT EXISTS closed_by_entry_no  INTEGER,
        ADD COLUMN IF NOT EXISTS closed_at_date      DATE,
        ADD COLUMN IF NOT EXISTS bal_account_no      VARCHAR(100);
    `);
    console.log("✅ Missing payment columns added");

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
