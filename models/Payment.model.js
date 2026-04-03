const { pool } = require("../config/db");

const Payment = {
  async findAll() {
    const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM payments WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo]
    );
    return result.rows;
  },

  async findByStatus(status) {
    const result = await pool.query(
      "SELECT * FROM payments WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    return result.rows;
  },

  async create(data, userId) {
    const result = await pool.query(
      `INSERT INTO payments (
        payment_number, invoice_id, partner_no,
        amount, payment_date, method, status, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        data.paymentNumber,
        data.invoiceId || null,
        data.partnerNo || null,
        data.amount,
        data.paymentDate || null,
        data.method || null,
        data.status || "Pending",
        userId || null,
      ]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE payments SET
        payment_number=$1, invoice_id=$2, partner_no=$3,
        amount=$4, payment_date=$5, method=$6,
        status=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [
        data.paymentNumber,
        data.invoiceId || null,
        data.partnerNo || null,
        data.amount,
        data.paymentDate || null,
        data.method || null,
        data.status || "Pending",
        id,
      ]
    );
    return result.rows[0] || null;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      "UPDATE payments SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM payments WHERE id=$1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = Payment;
