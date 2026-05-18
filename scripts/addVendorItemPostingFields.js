require('dotenv').config();
const { pool } = require('../config/db');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE item_requests
        ADD COLUMN IF NOT EXISTS vendor_item_no         VARCHAR(100),
        ADD COLUMN IF NOT EXISTS gen_prod_posting_group VARCHAR(50),
        ADD COLUMN IF NOT EXISTS vat_prod_posting_group VARCHAR(50)
    `);
    console.log('✅ Added vendor_item_no, gen_prod_posting_group, vat_prod_posting_group to item_requests');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
