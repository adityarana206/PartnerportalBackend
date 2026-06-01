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

  async findByCode(code) {
    const result = await pool.query(
      "SELECT * FROM payment_terms WHERE code = $1",
      [code]
    );
    return result.rows[0] || null;
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE payment_terms
       SET code = $1, description = $2, due_date_calculation = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [data.code, data.description, data.due_date_calculation ?? '', id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM payment_terms WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },

  async create(data) {
    const result = await pool.query(
      `INSERT INTO payment_terms (code, description, due_date_calculation, due_days, discount_days, discount_pct, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.code,
        data.description,
        data.due_date_calculation ?? '',
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
