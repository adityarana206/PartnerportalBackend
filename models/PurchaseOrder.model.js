const { pool } = require("../config/db");

const PurchaseOrder = {
  // ─── Create Order with Lines ───────────────────────────
  async create(data, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Insert Header ───────────────────────────────────
      const orderQuery = `
        INSERT INTO purchase_orders (
          order_type, partner_no, partner_type, ship_to_code,
          location_code, order_date, requested_delivery_date,
          currency_code, external_document_no, status,
          direction, submitted_date, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        ) RETURNING *;
      `;
      const orderValues = [
        data.orderType || null,
        data.partnerNo || null,
        data.partnerType || null,
        data.shipToCode || null,
        data.locationCode || null,
        data.orderDate || null,
        data.requestedDeliveryDate || null,
        data.currencyCode || null,
        data.externalDocumentNo || null,
        data.status || null,
        data.direction || null,
        data.submittedDate || null,
        userId || null,
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // ─── Insert Lines ────────────────────────────────────
      const lines = [];
      if (data.orderStagingLines && data.orderStagingLines.length > 0) {
        for (const line of data.orderStagingLines) {
          const lineQuery = `
            INSERT INTO purchase_order_lines (
              order_id, line_no, item_no, description,
              quantity, unit_of_measure_code, unit_price,
              line_discount_percent, line_discount_amount,
              line_amount, location_code, delivery_date, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            ) RETURNING *;
          `;
          const lineValues = [
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
            line.locationCode || null,
            line.deliveryDate || null,
            line.variantCode || null,
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
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

  // ─── Find All Orders with Lines ────────────────────────
  async findAll() {
    const orders = await pool.query(
      "SELECT * FROM purchase_orders ORDER BY created_at DESC",
    );

    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id],
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by ID with Lines ─────────────────────────────
  async findById(id) {
    const order = await pool.query(
      "SELECT * FROM purchase_orders WHERE id = $1",
      [id],
    );
    if (!order.rows[0]) return null;

    const lines = await pool.query(
      "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
      [id],
    );
    return { ...order.rows[0], orderStagingLines: lines.rows };
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    const orders = await pool.query(
      "SELECT * FROM purchase_orders WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo],
    );

    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id],
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by Status ────────────────────────────────────
  async findByStatus(status) {
    const orders = await pool.query(
      "SELECT * FROM purchase_orders WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );

    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id],
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Update Order Header ───────────────────────────────
  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ─── Update Header ───────────────────────────────────
      const orderQuery = `
        UPDATE purchase_orders SET
          order_type=$1, partner_no=$2, partner_type=$3,
          ship_to_code=$4, location_code=$5, order_date=$6,
          requested_delivery_date=$7, currency_code=$8,
          external_document_no=$9, status=$10, direction=$11,
          submitted_date=$12, updated_at=NOW()
        WHERE id=$13 RETURNING *;
      `;
      const orderValues = [
        data.orderType || null,
        data.partnerNo || null,
        data.partnerType || null,
        data.shipToCode || null,
        data.locationCode || null,
        data.orderDate || null,
        data.requestedDeliveryDate || null,
        data.currencyCode || null,
        data.externalDocumentNo || null,
        data.status || "Processed",
        data.direction || null,
        data.submittedDate || null,
        id,
      ];
      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // ─── Delete old lines and reinsert ───────────────────
      await client.query(
        "DELETE FROM purchase_order_lines WHERE order_id = $1",
        [id],
      );

      const lines = [];
      if (data.orderStagingLines && data.orderStagingLines.length > 0) {
        for (const line of data.orderStagingLines) {
          const lineQuery = `
            INSERT INTO purchase_order_lines (
              order_id, line_no, item_no, description,
              quantity, unit_of_measure_code, unit_price,
              line_discount_percent, line_discount_amount,
              line_amount, location_code, delivery_date, variant_code
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
            ) RETURNING *;
          `;
          const lineValues = [
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
            line.locationCode || null,
            line.deliveryDate || null,
            line.variantCode || null,
          ];
          const lineResult = await client.query(lineQuery, lineValues);
          lines.push(lineResult.rows[0]);
        }
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
      `UPDATE purchase_orders SET status=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] || null;
  },

  // ─── Approved items lookup for a partner (purchase line dropdown) ───
  async findApprovedItemsByPartner(partnerNo) {
    const result = await pool.query(
      `SELECT batch_no, item_name, description, base_unit_of_measure,
              unit_price, price_currency_code, item_category_code,
              net_weight, gross_weight, shelf_life_days
       FROM item_requests
       WHERE partner_no = $1 AND status = 'Approved' AND block = false
       ORDER BY item_name`,
      [partnerNo]
    );
    return result.rows;
  },

  // ─── Single approved item detail by partnerNo + batchNo ───────────
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

  // ─── Delete Order + Lines ──────────────────────────────
  async delete(id) {
    // Lines deleted automatically via ON DELETE CASCADE
    const result = await pool.query(
      "DELETE FROM purchase_orders WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0] || null;
  },
};

module.exports = PurchaseOrder;
