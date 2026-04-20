const { pool } = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE sales_order_lines
        ADD COLUMN IF NOT EXISTS line_amount_excl_vat NUMERIC(18,4) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS line_amount_incl_vat NUMERIC(18,4) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS vat_code             VARCHAR(20),
        ADD COLUMN IF NOT EXISTS vat_amount           NUMERIC(18,4) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS vat_percent          NUMERIC(8,4)  DEFAULT 0;
    `);
    console.log('✅ VAT columns added to sales_order_lines');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
