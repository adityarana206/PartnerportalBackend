const { pool } = require("../config/db");

async function dropPermissionTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS user_group_assignments CASCADE;
      DROP TABLE IF EXISTS group_permissions CASCADE;
      DROP TABLE IF EXISTS user_permissions CASCADE;
      DROP TABLE IF EXISTS permission_groups CASCADE;
      DROP TABLE IF EXISTS permissions CASCADE;
      DROP TABLE IF EXISTS screens CASCADE;
    `);
    console.log("Done. All permission tables dropped.");
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

dropPermissionTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
