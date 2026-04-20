const { pool } = require("../config/db");

const LoginUser = {
  async createTable() {
    await pool.query(`
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
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO login_users (user_id, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         password   = EXCLUDED.password,
         role       = EXCLUDED.role,
         updated_at = NOW()
       RETURNING *`,
      [data.userId, data.email, data.password, data.role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      "SELECT * FROM login_users WHERE email = $1 AND is_active = true",
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
