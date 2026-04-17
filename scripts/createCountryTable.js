const { pool } = require("../config/db");

async function createCountryTable() {
  const client = await pool.connect();
  try {
    console.log("🔄 Creating countries table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id           SERIAL PRIMARY KEY,
        code         VARCHAR(10)  NOT NULL UNIQUE,
        name         VARCHAR(100) NOT NULL,
        currency_code VARCHAR(10) NOT NULL,
        is_active    BOOLEAN      NOT NULL DEFAULT false,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    // Only one active row at a time — enforced via partial unique index
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_countries_single_active
        ON countries (is_active)
        WHERE is_active = true;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
    `);

    console.log("✅ countries table and indexes created");
    console.log("🎉 Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createCountryTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createCountryTable;
