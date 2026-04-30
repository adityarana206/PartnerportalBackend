require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

const SERIES = [
  { code: "DO",     description: "Delivery Order No",           prefix: "DO" },
  { code: "SO",     description: "Sales Order No",              prefix: "SO" },
  { code: "PORTAL", description: "Partner Portal No",           prefix: "PORTAL" },
  { code: "BATCH",  description: "Item Batch No",               prefix: "BATCH" },
  { code: "SHIP",   description: "Sales Shipment No",           prefix: "SHIP" },
];

async function run() {
  const client = await pool.connect();
  try {
    for (const s of SERIES) {
      const existing = await client.query("SELECT id FROM no_series WHERE code = $1", [s.code]);
      if (existing.rows.length > 0) {
        console.log(`⚠️  '${s.code}' already exists — skipped`);
        continue;
      }
      await client.query(
        `INSERT INTO no_series (code, description, starting_no, ending_no, last_no_used, increment_by_no, allow_gaps, date_order)
         VALUES ($1, $2, 1, 999999, 0, 1, false, false)`,
        [s.code, s.description]
      );
      console.log(`✅ '${s.code}' created`);
    }
    console.log("\n🎉 Done");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
