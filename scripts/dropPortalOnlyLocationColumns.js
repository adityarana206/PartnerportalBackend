require('dotenv').config();
const { pool } = require('../config/db');

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE partner_location_links
        DROP COLUMN IF EXISTS description,
        DROP COLUMN IF EXISTS address_name,
        DROP COLUMN IF EXISTS address_code,
        DROP COLUMN IF EXISTS partner_type,
        DROP COLUMN IF EXISTS partner_no,
        DROP COLUMN IF EXISTS created_by,
        DROP COLUMN IF EXISTS is_default,
        DROP COLUMN IF EXISTS blocked,
        DROP COLUMN IF EXISTS is_configured;
    `);
    console.log('✅ Dropped portal-only columns from partner_location_links');
  } catch (err) {
    console.error('❌', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
