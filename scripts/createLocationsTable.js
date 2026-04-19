require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

async function createLocationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id                  SERIAL PRIMARY KEY,
        system_id           VARCHAR(100) UNIQUE NOT NULL,
        code                VARCHAR(50)  UNIQUE NOT NULL,
        name                VARCHAR(255),
        address             VARCHAR(255),
        address2            VARCHAR(255),
        city                VARCHAR(100),
        post_code           VARCHAR(20),
        country_region_code VARCHAR(10),
        phone_no            VARCHAR(50),
        fax_no              VARCHAR(50),
        contact             VARCHAR(100),
        e_mail              VARCHAR(100),
        home_page           VARCHAR(255),
        county              VARCHAR(100),
        use_as_in_transit   BOOLEAN DEFAULT false,
        created_at          TIMESTAMP DEFAULT NOW(),
        updated_at          TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ locations table created");
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

createLocationsTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
