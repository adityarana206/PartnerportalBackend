const { pool } = require("../config/db");
require("dotenv").config();

const run = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_order_documents (
      id                SERIAL PRIMARY KEY,
      delivery_order_id INTEGER NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
      name              TEXT NOT NULL,
      url               TEXT NOT NULL,
      size              INTEGER DEFAULT 0,
      uploaded_at       TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("✅ delivery_order_documents table ready");
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
