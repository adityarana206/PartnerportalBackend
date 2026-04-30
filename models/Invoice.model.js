const { pool } = require("../config/db");

const Invoice = {
  // ─── Create Invoice with Lines ─────────────────────────
  async create(data, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Check duplicate invoiceNo ───────────────────────
      if (data.invoiceNo) {
        const existing = await client.query(
          "SELECT id FROM invoices WHERE invoice_no = $1",
          [data.invoiceNo],
        );
        if (existing.rows[0]) {
          throw new Error("Invoice number already exists");
        }
      }

      // ─── Insert Header ───────────────────────────────────
      const invoiceQuery = `
        INSERT INTO invoices (
          invoice_type, invoice_no, invoice_date, due_date,
          partner_no, partner_type, total_amount, currency_code,
          outstanding_amount, status, bc_invoice_no,
          linked_order_no, location_code, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
        ) RETURNING *;
      `;
      const invoiceValues = [
        data.invoiceType || null,
        data.invoiceNo || null,
        data.invoiceDate || null,
        data.dueDate || null,
        data.partnerNo || null,
        data.partnerType || null,
        data.totalAmount || 0,
        data.currencyCode || null,
        data.outstandingAmount || 0,
        data.status || null,
        data.bcInvoiceNo || null,
        data.linkedOrderNo || null,
        data.locationCode || null,
        userId || null,
      ];

      const invoiceResult = await client.query(invoiceQuery, invoiceValues);
      const invoice = invoiceResult.rows[0];

      // ─── Insert Lines ────────────────────────────────────
      const lines = [];
      if (data.portalInvoiceLine && data.portalInvoiceLine.length > 0) {
        for (const line of data.portalInvoiceLine) {
          const lineQuery = `
            INSERT INTO invoice_lines (
              invoice_id, line_no, item_no, description,
              line_amount, line_discount, line_discount_amount,
              quantity, unit_price, unit_of_measure_code,
              vat, vat_amount, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            ) RETURNING *;
          `;
          const lineValues = [
            invoice.id, // $1
            line.lineNo || null, // $2
            line.itemNo || null, // $3
            line.description || null, // $4
            line.lineAmount || 0, // $5
            line.lineDiscount || 0, // $6
            line.lineDiscountAmount || 0, // $7
            line.quantity || 0, // $8
            line.unitPrice || 0, // $9
            line.unitOfMeasureCode || null, // $10
            line.vat || 0, // $11
            line.vatAmount || 0, // $12
            line.variantCode || null, // $13
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      return { ...invoice, portalInvoiceLine: lines };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Find All ──────────────────────────────────────────
  async findAll() {
    const invoices = await pool.query(
      "SELECT * FROM invoices ORDER BY created_at DESC",
    );
    const result = [];
    for (const invoice of invoices.rows) {
      const lines = await pool.query(
        "SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY line_no",
        [invoice.id],
      );
      result.push({ ...invoice, portalInvoiceLine: lines.rows });
    }
    return result;
  },

  // ─── Find by ID ────────────────────────────────────────
  async findById(id) {
    const invoice = await pool.query("SELECT * FROM invoices WHERE id = $1", [
      id,
    ]);
    if (!invoice.rows[0]) return null;

    const lines = await pool.query(
      "SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY line_no",
      [id],
    );
    return { ...invoice.rows[0], portalInvoiceLine: lines.rows };
  },

  // ─── Find by Invoice No ────────────────────────────────
  async findByInvoiceNo(invoiceNo) {
    const invoice = await pool.query(
      "SELECT * FROM invoices WHERE invoice_no = $1",
      [invoiceNo],
    );
    if (!invoice.rows[0]) return null;

    const lines = await pool.query(
      "SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY line_no",
      [invoice.rows[0].id],
    );
    return { ...invoice.rows[0], portalInvoiceLine: lines.rows };
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    const invoices = await pool.query(
      "SELECT * FROM invoices WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo],
    );
    const result = [];
    for (const invoice of invoices.rows) {
      const lines = await pool.query(
        "SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY line_no",
        [invoice.id],
      );
      result.push({ ...invoice, portalInvoiceLine: lines.rows });
    }
    return result;
  },

  // ─── Find by Status ────────────────────────────────────
  async findByStatus(status) {
    const invoices = await pool.query(
      "SELECT * FROM invoices WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );
    const result = [];
    for (const invoice of invoices.rows) {
      const lines = await pool.query(
        "SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY line_no",
        [invoice.id],
      );
      result.push({ ...invoice, portalInvoiceLine: lines.rows });
    }
    return result;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Update Header ───────────────────────────────────
      const invoiceQuery = `
        UPDATE invoices SET
          invoice_type=$1, invoice_no=$2, invoice_date=$3,
          due_date=$4, partner_no=$5, partner_type=$6,
          total_amount=$7, currency_code=$8, outstanding_amount=$9,
          status=$10, bc_invoice_no=$11, linked_order_no=$12,
          location_code=$13, updated_at=NOW()
        WHERE id=$14 RETURNING *;
      `;
      const invoiceValues = [
        data.invoiceType || null,
        data.invoiceNo || null,
        data.invoiceDate || null,
        data.dueDate || null,
        data.partnerNo || null,
        data.partnerType || null,
        data.totalAmount || 0,
        data.currencyCode || null,
        data.outstandingAmount || 0,
        data.status || null,
        data.bcInvoiceNo || null,
        data.linkedOrderNo || null,
        data.locationCode || null,
        id,
      ];
      const invoiceResult = await client.query(invoiceQuery, invoiceValues);
      const invoice = invoiceResult.rows[0];

      // ─── Delete old lines and reinsert ───────────────────
      await client.query("DELETE FROM invoice_lines WHERE invoice_id = $1", [
        id,
      ]);

      const lines = [];
      if (data.portalInvoiceLine && data.portalInvoiceLine.length > 0) {
        for (const line of data.portalInvoiceLine) {
          const lineQuery = `
            INSERT INTO invoice_lines (
              invoice_id, line_no, item_no, description,
              line_amount, line_discount, line_discount_amount,
              quantity, unit_price, unit_of_measure_code,
              vat, vat_amount, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            ) RETURNING *;
          `;
          const lineValues = [
            id,
            line.lineNo || null,
            line.itemNo || null,
            line.description || null,
            line.lineAmount || 0,
            line.lineDiscount || 0,
            line.lineDiscountAmount || 0,
            line.quantity || 0,
            line.unitPrice || 0,
            line.unitOfMeasureCode || null,
            line.vat || 0,
            line.vatAmount || 0,
            line.variantCode || null,
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      return { ...invoice, portalInvoiceLine: lines };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Update Status Only ────────────────────────────────
  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE invoices SET status=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  },

  // ─── Delete Invoice + Lines (cascade) ─────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = Invoice;
