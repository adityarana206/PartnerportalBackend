const { pool } = require("../config/db");

const series = [
  {
    code: "SO",
    description: "Sales Order Number Series",
    starting_no: 1,
    ending_no: 999999,
    last_no_used: 0,
    increment_by_no: 1,
  },
  {
    code: "DO",
    description: "Delivery Order Number Series",
    starting_no: 1,
    ending_no: 999999,
    last_no_used: 0,
    increment_by_no: 1,
  },
  {
    code: "PORTAL",
    description: "Partner Portal Item Request Number Series",
    starting_no: 1,
    ending_no: 999999,
    last_no_used: 0,
    increment_by_no: 1,
  },
  {
    code: "BATCH",
    description: "Item Batch Number Series",
    starting_no: 1,
    ending_no: 999999,
    last_no_used: 0,
    increment_by_no: 1,
  },
  {
    code: "SHIP",
    description: "Sales Shipment Portal Document Number Series",
    starting_no: 1,
    ending_no: 999999,
    last_no_used: 0,
    increment_by_no: 1,
  },
];

async function seedNoSeries() {
  const client = await pool.connect();
  try {
    for (const s of series) {
      const existing = await client.query(
        "SELECT id FROM no_series WHERE code = $1",
        [s.code]
      );
      if (existing.rows.length > 0) {
        console.log(`SKIP  ${s.code} — already exists`);
        continue;
      }
      await client.query(
        `INSERT INTO no_series (code, description, starting_no, ending_no, last_no_used, increment_by_no, allow_gaps, date_order)
         VALUES ($1, $2, $3, $4, $5, $6, false, false)`,
        [s.code, s.description, s.starting_no, s.ending_no, s.last_no_used, s.increment_by_no]
      );
      console.log(`INSERT ${s.code}`);
    }
    console.log("Done.");
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedNoSeries()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
