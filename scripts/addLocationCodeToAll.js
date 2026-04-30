require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    const alterations = [
      "ALTER TABLE users              ADD COLUMN IF NOT EXISTS location_code VARCHAR(20) DEFAULT NULL",
      "ALTER TABLE invoices           ADD COLUMN IF NOT EXISTS location_code VARCHAR(20) DEFAULT NULL",
      "ALTER TABLE purchase_invoices  ADD COLUMN IF NOT EXISTS location_code VARCHAR(20) DEFAULT NULL",
      // sales_orders, sales_shipments, purchase_orders already have location_code — ensure just in case
      "ALTER TABLE sales_orders       ADD COLUMN IF NOT EXISTS location_code VARCHAR(20) DEFAULT NULL",
      "ALTER TABLE sales_shipments    ADD COLUMN IF NOT EXISTS location_code VARCHAR(20) DEFAULT NULL",
      "ALTER TABLE purchase_orders    ADD COLUMN IF NOT EXISTS location_code VARCHAR(20) DEFAULT NULL",
    ];

    for (const sql of alterations) {
      await client.query(sql);
      const table = sql.match(/ALTER TABLE (\w+)/)[1];
      console.log(`✅ location_code added to ${table}`);
    }

    console.log("\n🎉 Migration complete");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
