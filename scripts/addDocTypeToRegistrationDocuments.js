const { pool } = require('../config/db');

const run = async () => {
  await pool.query(`
    ALTER TABLE bc_user_registration_documents
    ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT NULL;
  `);
  console.log('✅ doc_type column added to bc_user_registration_documents');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
