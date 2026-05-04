require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE payments
      ADD CONSTRAINT payments_entry_unique UNIQUE (payment_number, partner_no);
    `);
    console.log("✅ Unique constraint on (payment_number, partner_no) added");

    await client.query("COMMIT");
    console.log("🎉 Migration complete");
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "42P07") {
      console.log("ℹ️  Constraint already exists, skipping");
      process.exit(0);
    }
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
