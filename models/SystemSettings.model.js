const { pool } = require("../config/db");

const SystemSettings = {
  async createTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id              SERIAL PRIMARY KEY,
        theme_primary   VARCHAR(7) DEFAULT '#1976d2',
        theme_secondary VARCHAR(7) DEFAULT '#dc004e',
        logo_url        TEXT,
        updated_by      INTEGER,
        updated_at      TIMESTAMP DEFAULT NOW()
      )
    `);

    const result = await pool.query("SELECT COUNT(*) FROM system_settings");
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO system_settings (theme_primary, theme_secondary)
        VALUES ('#1976d2', '#dc004e')
      `);
    }
  },

  async get() {
    const result = await pool.query("SELECT * FROM system_settings LIMIT 1");
    return result.rows[0] || null;
  },

  async updateTheme(primary, secondary, userId) {
    const result = await pool.query(
      `UPDATE system_settings
       SET theme_primary = $1, theme_secondary = $2, updated_by = $3, updated_at = NOW()
       WHERE id = (SELECT id FROM system_settings LIMIT 1)
       RETURNING *`,
      [primary, secondary, userId]
    );
    return result.rows[0];
  },

  async updateLogo(logoDataUri, userId) {
    const result = await pool.query(
      `UPDATE system_settings
       SET logo_url = $1, updated_by = $2, updated_at = NOW()
       WHERE id = (SELECT id FROM system_settings LIMIT 1)
       RETURNING *`,
      [logoDataUri, userId]
    );
    return result.rows[0];
  },

  async deleteLogo(userId) {
    const result = await pool.query(
      `UPDATE system_settings
       SET logo_url = NULL, updated_by = $1, updated_at = NOW()
       WHERE id = (SELECT id FROM system_settings LIMIT 1)
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  },
};

module.exports = SystemSettings;
