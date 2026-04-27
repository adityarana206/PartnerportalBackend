const { pool } = require("../config/db");

const PaymentTerms = {
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM payment_terms ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM payment_terms WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO payment_terms (code, description, due_days, discount_days, discount_pct, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.code,
        data.description,
        data.dueDays ?? 0,
        data.discountDays ?? 0,
        data.discountPct ?? 0.0,
        data.isActive ?? true,
      ]
    );
    return result.rows[0];
  },
};

module.exports = PaymentTerms;
