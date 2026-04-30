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
