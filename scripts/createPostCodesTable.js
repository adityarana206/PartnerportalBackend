require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_codes (
        id              SERIAL PRIMARY KEY,
        code            VARCHAR(20) NOT NULL,
        city            VARCHAR(100),
        country_code    VARCHAR(10),
        county          VARCHAR(100),
        system_id       VARCHAR(100) UNIQUE,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_post_codes_code_country ON post_codes (code, country_code);`);
    console.log("✅ post_codes table created successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
