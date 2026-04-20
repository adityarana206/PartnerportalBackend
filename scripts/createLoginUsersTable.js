const { pool } = require("../config/db");

async function createLoginUsersTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_users (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email        VARCHAR(255) UNIQUE NOT NULL,
        password     VARCHAR(255) NOT NULL,
        role         VARCHAR(50) NOT NULL,
        is_active    BOOLEAN DEFAULT true,
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ login_users table created (or already exists)");

    const count = await client.query("SELECT COUNT(*) FROM login_users");
    console.log(`   Existing rows: ${count.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error creating login_users table:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createLoginUsersTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
