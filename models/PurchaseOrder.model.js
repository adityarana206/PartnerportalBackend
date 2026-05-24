const { pool } = require("../config/db");
const NoSeries = require("./NoSeris.model");

const PurchaseOrder = {
  // ─── Create Order with Lines ───────────────────────────
  async create(data, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const portalDocumentNo = await NoSeries.getNextNumberByCode("PO");

      const orderResult = await client.query(
        `INSERT INTO purchase_orders (
          order_type, no, partner_no, partner_type, ship_to_code,
          location_code, order_date, requested_delivery_date,
          currency_code, external_document_no, status,
          direction, submitted_date, created_by, portal_document_no
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [
          data.orderType || null,
          data.No || null,
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
          portalDocumentNo,
        ]
      );
      const order = orderResult.rows[0];

      const lines = [];
      for (const line of data.orderStagingLines || []) {
        const qty      = parseFloat(line.quantity)  || 0;
        const unitPrice = parseFloat(line.unitPrice) || 0;
        const discPct  = parseFloat(line.lineDiscountPercent) || 0;
        const discountAmt = discPct > 0
          ? parseFloat((qty * unitPrice * discPct / 100).toFixed(4))
          : parseFloat(line.lineDiscountAmount) || 0;

        // Trust BC's pre-computed lineAmount to avoid rounding drift
        const lineAmount = parseFloat(line.lineAmount) || parseFloat((qty * unitPrice - discountAmt).toFixed(4));

        // BC's vatAmount can be negative when invoice discounts are present
        // NEVER wrap in Math.abs() — the negative sign encodes the invoice discount
        const vatPercent = parseFloat(line.vatPercent) || 0;
        const vatAmount  = parseFloat(String(line.vatAmount ?? 0));

        // Trust BC's lineAmountInclVat directly (already accounts for invoice discounts)
        const bcInclVat = parseFloat(line.lineAmountInclVat || line.lineAmountIncludingVat || 0);
        const lineAmountInclVat = bcInclVat || parseFloat((lineAmount + vatAmount).toFixed(4));

        const lineResult = await client.query(
          `INSERT INTO purchase_order_lines (
            order_id, line_document_no, line_no, item_no, description,
            quantity, unit_of_measure_code, unit_price,
            line_discount_percent, line_discount_amount,
            line_amount, location_code, delivery_date, variant_code,
            vat_code, vat_percent, vat_amount, line_amount_incl_vat
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
          [
            order.id,
            line.documentNo || null,
            line.lineNo || null,
            line.itemNo || null,
            line.description || null,
            qty,
            line.unitOfMeasureCode || null,
            unitPrice,
            discPct,
            discountAmt,
            lineAmount,
            line.locationCode || null,
            line.deliveryDate || null,
            line.variantCode || null,
            line.vatCode || null,
            vatPercent,
            vatAmount,
            lineAmountInclVat,
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

  // ─── Find All Orders with Lines ────────────────────────
  async findAll() {
    const orders = await pool.query("SELECT * FROM purchase_orders ORDER BY created_at DESC");
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id]
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by ID with Lines ─────────────────────────────
  async findById(id) {
    const order = await pool.query("SELECT * FROM purchase_orders WHERE id = $1", [id]);
    if (!order.rows[0]) return null;
    const lines = await pool.query(
      "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
      [id]
    );
    return { ...order.rows[0], orderStagingLines: lines.rows };
  },

  // ─── Find by Partner No ────────────────────────────────
  async findByPartnerNo(partnerNo) {
    const orders = await pool.query(
      "SELECT * FROM purchase_orders WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo]
    );
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id]
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find by Status ────────────────────────────────────
  async findByStatus(status) {
    const orders = await pool.query(
      "SELECT * FROM purchase_orders WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    const result = [];
    for (const order of orders.rows) {
      const lines = await pool.query(
        "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
        [order.id]
      );
      result.push({ ...order, orderStagingLines: lines.rows });
    }
    return result;
  },

  // ─── Find Released POs eligible for DO ───────────────
  async findEligibleForDO(partnerNo) {
    const q = partnerNo
      ? `SELECT po.*, json_agg(pol.* ORDER BY pol.line_no) AS "orderStagingLines"
         FROM purchase_orders po
         LEFT JOIN purchase_order_lines pol ON pol.order_id = po.id
         WHERE po.status IN ('Released','Accepted') AND po.partner_no = $1
         GROUP BY po.id ORDER BY po.created_at DESC`
      : `SELECT po.*, json_agg(pol.* ORDER BY pol.line_no) AS "orderStagingLines"
         FROM purchase_orders po
         LEFT JOIN purchase_order_lines pol ON pol.order_id = po.id
         WHERE po.status IN ('Released','Accepted')
         GROUP BY po.id ORDER BY po.created_at DESC`;
    const { rows } = await pool.query(q, partnerNo ? [partnerNo] : []);
    return rows;
  },

  // ─── Update Order ──────────────────────────────────────
  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `UPDATE purchase_orders SET
          order_type=$1, no=$2, partner_no=$3, partner_type=$4,
          ship_to_code=$5, location_code=$6, order_date=$7,
          requested_delivery_date=$8, currency_code=$9,
          external_document_no=$10, status=$11,
          direction=$12, submitted_date=$13, updated_at=NOW()
        WHERE id=$14 RETURNING *`,
        [
          data.orderType || null,
          data.No || null,
          data.partnerNo || null,
          data.partnerType || null,
          data.shipToCode || null,
          data.locationCode || null,
          data.orderDate || null,
          data.requestedDeliveryDate || null,
          data.currencyCode || null,
          data.externalDocumentNo || null,
          data.status || 'Released',
          data.direction || null,
          data.submittedDate || null,
          id,
        ]
      );
      const order = orderResult.rows[0];

      await client.query("DELETE FROM purchase_order_lines WHERE order_id = $1", [id]);

      const lines = [];
      for (const line of data.orderStagingLines || []) {
        const qty      = parseFloat(line.quantity)  || 0;
        const unitPrice = parseFloat(line.unitPrice) || 0;
        const discPct  = parseFloat(line.lineDiscountPercent) || 0;
        const discountAmt = discPct > 0
          ? parseFloat((qty * unitPrice * discPct / 100).toFixed(4))
          : parseFloat(line.lineDiscountAmount) || 0;

        // Trust BC's pre-computed lineAmount to avoid rounding drift
        const lineAmount = parseFloat(line.lineAmount) || parseFloat((qty * unitPrice - discountAmt).toFixed(4));

        // BC's vatAmount can be negative when invoice discounts are present
        // NEVER wrap in Math.abs() — the negative sign encodes the invoice discount
        const vatPercent = parseFloat(line.vatPercent) || 0;
        const vatAmount  = parseFloat(String(line.vatAmount ?? 0));

        // Trust BC's lineAmountInclVat directly (already accounts for invoice discounts)
        const bcInclVat = parseFloat(line.lineAmountInclVat || line.lineAmountIncludingVat || 0);
        const lineAmountInclVat = bcInclVat || parseFloat((lineAmount + vatAmount).toFixed(4));

        const lineResult = await client.query(
          `INSERT INTO purchase_order_lines (
            order_id, line_document_no, line_no, item_no, description,
            quantity, unit_of_measure_code, unit_price,
            line_discount_percent, line_discount_amount,
            line_amount, location_code, delivery_date, variant_code,
            vat_code, vat_percent, vat_amount, line_amount_incl_vat
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
          [
            id,
            line.documentNo || null,
            line.lineNo || null,
            line.itemNo || null,
            line.description || null,
            qty,
            line.unitOfMeasureCode || null,
            unitPrice,
            discPct,
            discountAmt,
            lineAmount,
            line.locationCode || null,
            line.deliveryDate || null,
            line.variantCode || null,
            line.vatCode || null,
            vatPercent,
            vatAmount,
            lineAmountInclVat,
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
  async updateStatus(id, status, portalStatus, portalDocumentNo) {
    const result = await pool.query(
      `UPDATE purchase_orders
       SET status=$1,
           portal_status=$2,
           portal_document_no=COALESCE($3, portal_document_no),
           updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [status, portalStatus || null, portalDocumentNo || null, id]
    );
    return result.rows[0] || null;
  },

  // ─── Update Shipped Quantities and Check if Fully Shipped ───
  async updateShippedQuantities(poId, deliveryLines) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update shipped_qty for each line in the delivery order
      for (const line of deliveryLines) {
        if (line.poId === poId && line.poLineId) {
          await client.query(
            `UPDATE purchase_order_lines 
             SET shipped_qty = shipped_qty + $1, updated_at = NOW() 
             WHERE id = $2`,
            [line.toBeShipped, line.poLineId]
          );
        }
      }

      // Check if all lines are fully shipped
      const result = await client.query(
        `SELECT 
           COUNT(*) as total_lines,
           COUNT(*) FILTER (WHERE quantity <= shipped_qty) as fully_shipped_lines
         FROM purchase_order_lines 
         WHERE order_id = $1`,
        [poId]
      );

      await client.query("COMMIT");

      const { total_lines, fully_shipped_lines } = result.rows[0];
      return parseInt(total_lines) === parseInt(fully_shipped_lines) && parseInt(total_lines) > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Approved items lookup ─────────────────────────────
  async findApprovedItemsByPartner(partnerNo) {
    const result = await pool.query(
      `SELECT batch_no, item_name, description, base_unit_of_measure,
              unit_price, price_currency_code, item_category_code,
              net_weight, gross_weight, shelf_life_days
       FROM item_requests
       WHERE partner_no = $1 AND LOWER(status) = 'approved'
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
       WHERE partner_no = $1 AND batch_no = $2 AND LOWER(status) = 'approved'`,
      [partnerNo, batchNo]
    );
    return result.rows[0] || null;
  },

  // ─── Delete Order + Lines ──────────────────────────────
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM purchase_orders WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = PurchaseOrder;
