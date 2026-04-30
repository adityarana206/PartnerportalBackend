require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Add column if not exists
    await client.query(`
      ALTER TABLE purchase_orders
      ADD COLUMN IF NOT EXISTS portal_document_no VARCHAR(50) UNIQUE;
    `);
    console.log("✅ Column portal_document_no added (or already exists)");

    // 2. Ensure PO number series exists
    const existing = await client.query(
      "SELECT id FROM no_series WHERE code = 'PO'"
    );
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO no_series (code, description, starting_no, ending_no, last_no_used, increment_by_no, allow_gaps, date_order)
        VALUES ('PO', 'Purchase Order Portal Document No', 1, 999999, 0, 1, false, false)
      `);
      console.log("✅ PO number series created");
    } else {
      console.log("⚠️  PO number series already exists");
    }

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
