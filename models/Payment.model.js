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
        payment_number, invoice_id, invoice_no, order_no, partner_no,
        amount, payment_date, due_date, currency_code, method,
        reference_no, status, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        data.paymentNumber,
        data.invoiceId || null,
        data.invoiceNo || null,
        data.orderNo || null,
        data.partnerNo || null,
        data.amount,
        data.paymentDate || null,
        data.dueDate || null,
        data.currencyCode || null,
        data.method || data.paymentMethod || null,
        data.referenceNo || null,
        data.status || "Pending",
        userId || null,
      ]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE payments SET
        payment_number=$1, invoice_id=$2, invoice_no=$3, order_no=$4,
        partner_no=$5, amount=$6, payment_date=$7, due_date=$8,
        currency_code=$9, method=$10, reference_no=$11,
        status=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [
        data.paymentNumber,
        data.invoiceId || null,
        data.invoiceNo || null,
        data.orderNo || null,
        data.partnerNo || null,
        data.amount,
        data.paymentDate || null,
        data.dueDate || null,
        data.currencyCode || null,
        data.method || data.paymentMethod || null,
        data.referenceNo || null,
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
