const { pool } = require("../config/db");

const LoginUser = {
  async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_users (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
        partner_no   VARCHAR(50),
        email        VARCHAR(255) UNIQUE NOT NULL,
        password     VARCHAR(255) NOT NULL,
        role         VARCHAR(50) NOT NULL,
        is_active    BOOLEAN DEFAULT true,
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      )
    `);
    // Add partner_no to existing tables that were created before this column was introduced
    await pool.query(`
      ALTER TABLE login_users ADD COLUMN IF NOT EXISTS partner_no VARCHAR(50)
    `);
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO login_users (user_id, partner_no, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         partner_no = EXCLUDED.partner_no,
         password   = EXCLUDED.password,
         role       = EXCLUDED.role,
         updated_at = NOW()
       RETURNING *`,
      [data.userId, data.partnerNo || null, data.email, data.password, data.role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      "SELECT * FROM login_users WHERE LOWER(email) = LOWER($1) AND is_active = true",
      [email]
    );
    return result.rows[0] || null;
  },

  async findByUserId(userId) {
    const result = await pool.query(
      "SELECT * FROM login_users WHERE user_id = $1",
      [userId]
    );
    return result.rows[0] || null;
  },

  async updatePassword(email, hashedPassword) {
    const result = await pool.query(
      `UPDATE login_users SET password = $1, updated_at = NOW()
       WHERE email = $2 RETURNING *`,
      [hashedPassword, email]
    );
    return result.rows[0] || null;
  },

  async deactivate(userId) {
    const result = await pool.query(
      `UPDATE login_users SET is_active = false, updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = LoginUser;
