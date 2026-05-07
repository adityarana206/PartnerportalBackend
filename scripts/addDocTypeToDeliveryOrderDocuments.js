const { pool } = require('../config/db');
require('dotenv').config();

const run = async () => {
  await pool.query(`
    ALTER TABLE delivery_order_documents
    ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT NULL;
  `);
  console.log('✅ doc_type column added to delivery_order_documents');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
