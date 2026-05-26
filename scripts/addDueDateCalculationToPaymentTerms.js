require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE payment_terms
        ADD COLUMN IF NOT EXISTS due_date_calculation VARCHAR(50) NOT NULL DEFAULT '';
    `);
    console.log("✅ due_date_calculation column added to payment_terms");

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
