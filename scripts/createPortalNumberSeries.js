const { pool } = require("../config/db");

async function createPortalNumberSeries() {
  const client = await pool.connect();
  try {
    console.log("🔄 Creating PORTAL number series...");

    // Check if PORTAL series already exists
    const existing = await client.query(
      "SELECT * FROM no_series WHERE code = 'PORTAL'"
    );

    if (existing.rows.length > 0) {
      console.log("⚠️  PORTAL number series already exists");
      return existing.rows[0];
    }

    // Create PORTAL number series
    const result = await client.query(`
      INSERT INTO no_series (
        code, description, starting_no, ending_no,
        last_no_used, increment_by_no, allow_gaps, date_order
      ) VALUES (
        'PORTAL', 'Partner Portal Number Series', 1, 999999, 0, 1, false, false
      ) RETURNING *;
    `);

    console.log("✅ PORTAL number series created successfully");
    return result.rows[0];

  } catch (error) {
    console.error("❌ Error creating PORTAL number series:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createPortalNumberSeries()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createPortalNumberSeries;
