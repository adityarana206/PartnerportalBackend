const { pool } = require("../config/db");

const Country = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO countries (code, name, currency_code, is_active)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        data.code?.toUpperCase(),
        data.name,
        data.currencyCode?.toUpperCase(),
        data.isActive || false,
      ]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query("SELECT * FROM countries ORDER BY name");
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM countries WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findActive() {
    const result = await pool.query("SELECT * FROM countries WHERE is_active = true LIMIT 1");
    return result.rows[0] || null;
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE countries
       SET code=$1, name=$2, currency_code=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [
        data.code?.toUpperCase(),
        data.name,
        data.currencyCode?.toUpperCase(),
        id,
      ]
    );
    return result.rows[0] || null;
  },

  // Deactivate all, then activate the chosen one — done in a transaction
  async activate(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE countries SET is_active = false, updated_at = NOW()");
      const result = await client.query(
        "UPDATE countries SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );
      await client.query("COMMIT");
      return result.rows[0] || null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM countries WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = Country;
