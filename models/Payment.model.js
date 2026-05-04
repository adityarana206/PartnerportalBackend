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
        amount, amount_lcy, remaining_amount,
        payment_date, due_date, posting_date, document_date,
        currency_code, method, reference_no, status,
        description, transaction_type, document_type, document_no,
        vendor_name, customer_name, applies_to_doc_no, applies_to_doc_type,
        open, closed, closed_by_entry_no, closed_at_date, bal_account_no,
        created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30) RETURNING *`,
      [
        data.paymentNumber,
        data.invoiceId        || null,
        data.invoiceNo        || null,
        data.orderNo          || null,
        data.partnerNo        || null,
        data.amount           ?? 0,
        data.amountLCY        ?? null,
        data.remainingAmount  ?? null,
        data.paymentDate      || null,
        data.dueDate          || null,
        data.postingDate      || null,
        data.documentDate     || null,
        data.currencyCode     || null,
        data.method || data.paymentMethod || null,
        data.referenceNo      || null,
        data.status           || "Pending",
        data.description      || null,
        data.transactionType  || null,
        data.documentType     || null,
        data.documentNo       || null,
        data.vendorName       || null,
        data.customerName     || null,
        data.appliesToDocNo   || null,
        data.appliesToDocType || null,
        data.open  != null ? data.open  : null,
        data.closed != null ? data.closed : null,
        data.closedByEntryNo  || null,
        data.closedAtDate     || null,
        data.balAccountNo     || null,
        userId || null,
      ]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE payments SET
        payment_number=$1, invoice_id=$2, invoice_no=$3, order_no=$4,
        partner_no=$5, amount=$6, amount_lcy=$7, remaining_amount=$8,
        payment_date=$9, due_date=$10, posting_date=$11, document_date=$12,
        currency_code=$13, method=$14, reference_no=$15, status=$16,
        description=$17, transaction_type=$18, document_type=$19, document_no=$20,
        vendor_name=$21, customer_name=$22, applies_to_doc_no=$23, applies_to_doc_type=$24,
        open=$25, closed=$26, closed_by_entry_no=$27, closed_at_date=$28, bal_account_no=$29,
        updated_at=NOW()
       WHERE id=$30 RETURNING *`,
      [
        data.paymentNumber,
        data.invoiceId        || null,
        data.invoiceNo        || null,
        data.orderNo          || null,
        data.partnerNo        || null,
        data.amount           ?? 0,
        data.amountLCY        ?? null,
        data.remainingAmount  ?? null,
        data.paymentDate      || null,
        data.dueDate          || null,
        data.postingDate      || null,
        data.documentDate     || null,
        data.currencyCode     || null,
        data.method || data.paymentMethod || null,
        data.referenceNo      || null,
        data.status           || "Pending",
        data.description      || null,
        data.transactionType  || null,
        data.documentType     || null,
        data.documentNo       || null,
        data.vendorName       || null,
        data.customerName     || null,
        data.appliesToDocNo   || null,
        data.appliesToDocType || null,
        data.open  != null ? data.open  : null,
        data.closed != null ? data.closed : null,
        data.closedByEntryNo  || null,
        data.closedAtDate     || null,
        data.balAccountNo     || null,
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

  async deleteByPartnerNo(partnerNo) {
    const result = await pool.query(
      "DELETE FROM payments WHERE partner_no = $1",
      [partnerNo]
    );
    return result.rowCount;
  },

  async upsertByEntryNo(data, userId) {
    const result = await pool.query(
      `INSERT INTO payments (
        payment_number, invoice_id, invoice_no, order_no, partner_no,
        amount, amount_lcy, remaining_amount,
        payment_date, due_date, posting_date, document_date,
        currency_code, method, reference_no, status,
        description, transaction_type, document_type, document_no,
        vendor_name, customer_name, applies_to_doc_no, applies_to_doc_type,
        open, closed, closed_by_entry_no, closed_at_date, bal_account_no,
        created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
      ON CONFLICT (payment_number, partner_no)
      DO UPDATE SET
        invoice_id=$2, invoice_no=$3, order_no=$4,
        amount=$6, amount_lcy=$7, remaining_amount=$8,
        payment_date=$9, due_date=$10, posting_date=$11, document_date=$12,
        currency_code=$13, method=$14, reference_no=$15, status=$16,
        description=$17, transaction_type=$18, document_type=$19, document_no=$20,
        vendor_name=$21, customer_name=$22, applies_to_doc_no=$23, applies_to_doc_type=$24,
        open=$25, closed=$26, closed_by_entry_no=$27, closed_at_date=$28, bal_account_no=$29,
        updated_at=NOW()
      RETURNING *`,
      [
        data.paymentNumber,
        data.invoiceId          || null,
        data.invoiceNo          || null,
        data.orderNo            || null,
        data.partnerNo          || null,
        data.amount             ?? 0,
        data.amountLCY          ?? null,
        data.remainingAmount    ?? null,
        data.paymentDate        || null,
        data.dueDate            || null,
        data.postingDate        || null,
        data.documentDate       || null,
        data.currencyCode       || null,
        data.method             || null,
        data.referenceNo        || null,
        data.status             || "Pending",
        data.description        || null,
        data.transactionType    || null,
        data.documentType       || null,
        data.documentNo         || null,
        data.vendorName         || null,
        data.customerName       || null,
        data.appliesToDocNo     || null,
        data.appliesToDocType   || null,
        data.open  != null ? data.open  : null,
        data.closed != null ? data.closed : null,
        data.closedByEntryNo    || null,
        data.closedAtDate       || null,
        data.balAccountNo       || null,
        userId || null,
      ]
    );
    return result.rows[0];
  },
};

module.exports = Payment;
