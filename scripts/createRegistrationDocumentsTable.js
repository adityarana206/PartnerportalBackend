const { pool } = require("../config/db");
require("dotenv").config();

const run = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bc_user_registration_documents (
      id              SERIAL PRIMARY KEY,
      registration_id INTEGER NOT NULL REFERENCES bc_user_registrations(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      url             TEXT NOT NULL,
      size            INTEGER DEFAULT 0,
      uploaded_at     TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("✅ bc_user_registration_documents table ready");
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
