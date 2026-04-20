const { pool } = require("../config/db");
const NoSeries = require("./NoSeris.model");

const SalesOrder = {
  // ─── Create Order with Lines ───────────────────────────
  async create(data, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Generate incremental partner_order_no from no_series e.g. SO000001
      const partnerOrderNo = await NoSeries.getNextNumberByCode('SO');

      const orderResult = await client.query(
        `INSERT INTO sales_orders (
          order_type, partner_no, partner_type, ship_to_code,
          location_code, order_date, requested_delivery_date,
          currency_code, external_document_no, document_no, status,
          direction, submitted_date, created_by,
          partner_order_no, partner_order_status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
        [
          data.orderType || null,
          data.partnerNo || null,
          data.partnerType || null,
          data.shipToCode || null,
          data.locationCode || null,
          data.orderDate || null,
          data.requestedDeliveryDate || null,
          data.currencyCode || null,
          data.externalDocumentNo || null,
          data.documentNo || null,
          data.status || 'Confirmed',
          data.direction || null,
          data.submittedDate || null,
          userId || null,
          partnerOrderNo,
          'Confirmed',
        ]
      );
      const order = orderResult.rows[0];

      const lines = [];
      for (const line of data.orderStagingLines || []) {
        const lineResult = await client.query(
          `INSERT INTO sales_order_lines (
            order_id, line_no, item_no, description,
            quantity, unit_of_measure_code, unit_price,
            line_discount_percent, line_discount_amount,
            line_amount, line_amount_excl_vat, line_amount_incl_vat,
            vat_code, vat_amount, vat_percent,
            location_code, delivery_date, variant_code,
            line_document_no
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
          [
            order.id,
            line.lineNo || null,
            line.itemNo || null,
            line.description || null,
            line.quantity || 0,
            line.unitOfMeasureCode || null,
            line.unitPrice || 0,
            line.lineDiscountPercent || 0,
            line.lineDiscountAmount || 0,
            line.lineAmount || 0,
            line.lineAmountExclVat || line.lineAmount || 0,
            line.lineAmountInclVat || line.lineAmount || 0,
            line.vatCode || null,
            line.vatAmount || 0,
            line.vatPercent || 0,
            line.locationCode || null,
            line.deliveryDate || null,
            line.variantCode || null,
            line.LinedocumentNo || line.lineDocumentNo || null,
          ]
        );
        lines.push(lineResult.rows[0]);
      }

      await client.query("COMMIT");
      return { ...order, orderStagingLines: lines };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Find All ──────────────────────────────────────────
  async findAll() {
    const orders = await pool.query("SELECT * FROM sales_orders ORDER BY created_at DESC");
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id]
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by ID ────────────────────────────────────────
  async findById(id) {
    const order = await pool.query("SELECT * FROM sales_orders WHERE id = $1", [id]);
    if (!order.rows[0]) return null;
    const lines = await pool.query(
      "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
      [id]
    );
    return { ...order.rows[0], orderStagingLines: lines.rows };
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    const orders = await pool.query(
      "SELECT * FROM sales_orders WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo]
    );
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id]
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by Status ────────────────────────────────────
  async findByStatus(status) {
    const orders = await pool.query(
      "SELECT * FROM sales_orders WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id]
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Update ────────────────────────────────────────────
  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `UPDATE sales_orders SET
          order_type=$1, partner_no=$2, partner_type=$3,
          ship_to_code=$4, location_code=$5, order_date=$6,
          requested_delivery_date=$7, currency_code=$8,
          external_document_no=$9, document_no=$10, status=$11,
          direction=$12, submitted_date=$13, updated_at=NOW()
        WHERE id=$14 RETURNING *`,
        [
          data.orderType || null,
          data.partnerNo || null,
          data.partnerType || null,
          data.shipToCode || null,
          data.locationCode || null,
          data.orderDate || null,
          data.requestedDeliveryDate || null,
          data.currencyCode || null,
          data.externalDocumentNo || null,
          data.documentNo || null,
          data.status || "Processed",
          data.direction || null,
          data.submittedDate || null,
          id,
        ]
      );
      const order = orderResult.rows[0];

      await client.query("DELETE FROM sales_order_lines WHERE order_id = $1", [id]);

      const lines = [];
      for (const line of data.orderStagingLines || []) {
        const lineResult = await client.query(
          `INSERT INTO sales_order_lines (
            order_id, line_no, item_no, description,
            quantity, unit_of_measure_code, unit_price,
            line_discount_percent, line_discount_amount,
            line_amount, line_amount_excl_vat, line_amount_incl_vat,
            vat_code, vat_amount, vat_percent,
            location_code, delivery_date, variant_code,
            line_document_no
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
          [
            id,
            line.lineNo || null,
            line.itemNo || null,
            line.description || null,
            line.quantity || 0,
            line.unitOfMeasureCode || null,
            line.unitPrice || 0,
            line.lineDiscountPercent || 0,
            line.lineDiscountAmount || 0,
            line.lineAmount || 0,
            line.lineAmountExclVat || line.lineAmount || 0,
            line.lineAmountInclVat || line.lineAmount || 0,
            line.vatCode || null,
            line.vatAmount || 0,
            line.vatPercent || 0,
            line.locationCode || null,
            line.deliveryDate || null,
            line.variantCode || null,
            line.LinedocumentNo || line.lineDocumentNo || null,
          ]
        );
        lines.push(lineResult.rows[0]);
      }

      await client.query("COMMIT");
      return { ...order, orderStagingLines: lines };
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
      `UPDATE sales_orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  // ─── Patch by partner_order_no ─────────────────────────
  async patchByPartnerOrderNo(partnerOrderNo, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.status !== undefined)              { fields.push(`status=$${i++}`);               values.push(data.status); }
    if (data.partnerOrderStatus !== undefined)  { fields.push(`partner_order_status=$${i++}`); values.push(data.partnerOrderStatus); }
    if (data.documentNo !== undefined)          { fields.push(`document_no=$${i++}`);          values.push(data.documentNo); }
    if (data.direction !== undefined)           { fields.push(`direction=$${i++}`);            values.push(data.direction); }

    if (!fields.length) throw new Error('No fields to update');

    fields.push(`updated_at=NOW()`);
    values.push(partnerOrderNo);

    const result = await pool.query(
      `UPDATE sales_orders SET ${fields.join(', ')} WHERE partner_order_no=$${i} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // ─── Delete Order + Lines (cascade) ───────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM sales_orders WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },

  // ─── Approved items lookup ─────────────────────────────
  async findApprovedItemsByPartner(partnerNo) {
    const result = await pool.query(
      `SELECT batch_no, item_name, description, base_unit_of_measure,
              unit_price, price_currency_code, item_category_code,
              net_weight, gross_weight, shelf_life_days
       FROM item_requests
       WHERE partner_no = $1 AND LOWER(status) = 'approved' AND block = false
       ORDER BY item_name`,
      [partnerNo]
    );
    return result.rows;
  },

  // ─── Single approved item detail ──────────────────────
  async findApprovedItemDetail(partnerNo, batchNo) {
    const result = await pool.query(
      `SELECT batch_no, item_name, description, base_unit_of_measure,
              unit_price, price_currency_code, item_category_code,
              net_weight, gross_weight, shelf_life_days
       FROM item_requests
       WHERE partner_no = $1 AND batch_no = $2 AND status = 'Approved' AND block = false`,
      [partnerNo, batchNo]
    );
    return result.rows[0] || null;
  },
};

module.exports = SalesOrder;
