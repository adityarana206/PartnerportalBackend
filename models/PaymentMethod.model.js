const { pool } = require("../config/db");

const PaymentMethod = {
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM payment_methods ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM payment_methods WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE payment_methods SET name = $1, code = $2, description = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [data.code, data.code, data.description ?? null, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM payment_methods WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO payment_methods (name, code, description, is_active)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.name || data.code, data.code, data.description || null, data.isActive ?? true]
    );
    return result.rows[0];
  },
};

module.exports = PaymentMethod;
