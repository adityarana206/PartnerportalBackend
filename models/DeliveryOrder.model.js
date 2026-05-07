const { pool } = require("../config/db");
const NoSeries = require("./NoSeris.model");

// ─── Helpers ──────────────────────────────────────────────
async function fetchLines(client, deliveryOrderId) {
  const r = await client.query(
    "SELECT * FROM delivery_order_lines WHERE delivery_order_id = $1 ORDER BY line_no",
    [deliveryOrderId]
  );
  return r.rows;
}

function computeTotals(lines) {
  return {
    totalItems: lines.length,
    totalQuantity: lines.reduce((s, l) => s + parseFloat(l.order_qty || 0), 0),
    totalShipped: lines.reduce((s, l) => s + parseFloat(l.to_be_shipped || 0), 0),
  };
}

async function insertLines(client, deliveryOrderId, lines) {
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = line.poLineNo || line.lineNo || (i + 1) * 10000;
    const r = await client.query(
      `INSERT INTO delivery_order_lines (
         delivery_order_id, line_no, po_id, po_line_id,
         po_no, po_line_no, po_date_time, po_total_amount,
         item_no, variant_code, description,
         order_qty, ordered_quantity, to_be_shipped, shipped_quantity,
         remaining, remaining_quantity,
         unit_of_measure, unit_price, lot_no, serial_no, expiration_date
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      [
        deliveryOrderId,
        lineNo,
        line.poId              || null,
        line.poLineId          || null,
        line.poNo              || null,
        line.poLineNo          || null,
        line.poDateTime        || null,
        line.poTotalAmount     || null,
        line.itemNo            || '',
        line.variantCode       || null,
        line.description       || '',
        parseFloat(line.orderQty)        || parseFloat(line.orderedQuantity)  || 0,
        parseFloat(line.orderedQuantity) || parseFloat(line.orderQty)         || 0,
        parseFloat(line.toBeShipped)     || parseFloat(line.shippedQuantity)  || 0,
        parseFloat(line.shippedQuantity) || parseFloat(line.toBeShipped)      || 0,
        parseFloat(line.remaining)       || parseFloat(line.remainingQuantity)|| 0,
        parseFloat(line.remainingQuantity)|| parseFloat(line.remaining)       || 0,
        line.unitOfMeasure     || line.unitOfMeasureCode || 'PCS',
        line.unitPrice         || null,
        line.lotNo             || null,
        line.serialNo          || null,
        line.expirationDate && line.expirationDate !== '0001-01-01' ? line.expirationDate : null,
      ]
    );
    result.push(r.rows[0]);
  }
  return result;
}

// ─── Model ────────────────────────────────────────────────
const DeliveryOrder = {
  async create(data, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Get next DO number inside transaction so rollback doesn't waste numbers
      const doNo = await NoSeries.getNextNumberByCode("DO");

      const r = await client.query(
        `INSERT INTO delivery_orders (
           delivery_order_no, partner_no, partner_name, partner_type, erp_po_nos,
           delivery_date_time, delivery_type, direction,
           shipment_date, expected_delivery_date, actual_delivery_date,
           location_code, warehouse_location, carrier_name, transport_mode,
           total_amount, currency_code,
           ship_address, ship_city, ship_state, ship_post_code, ship_country_code,
           status, remarks, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25) RETURNING *`,
        [
          data.deliveryOrderNo       || doNo,
          data.partnerNo,
          data.partnerName           || null,
          data.partnerType           || null,
          Array.isArray(data.erpPoNos) ? data.erpPoNos : [],
          data.deliveryDateTime      || null,
          data.deliveryType          || null,
          data.direction             || null,
          data.shipmentDate,
          data.expectedDeliveryDate  || null,
          data.actualDeliveryDate    || null,
          data.locationCode          || null,
          data.warehouseLocation     || null,
          data.carrierName           || null,
          data.transportMode         || null,
          data.totalAmount           || null,
          data.currencyCode          || null,
          data.shipAddress           || null,
          data.shipCity              || null,
          data.shipState             || null,
          data.shipPostCode          || null,
          data.shipCountryCode       || null,
          data.status                || "Created",
          data.remarks               || null,
          userId                     || null,
        ]
      );
      const order = r.rows[0];
      const lines = await insertLines(client, order.id, data.lines || data.deliveryStagingsLine || []);

      // Insert documents (SharePoint URLs)
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          await client.query(
            `INSERT INTO delivery_order_documents (delivery_order_id, name, url, size, doc_type) VALUES ($1,$2,$3,$4,$5)`,
            [order.id, doc.name || "", doc.url || "", doc.size || 0, doc.docType || null]
          );
        }
      }

      await client.query("COMMIT");
      return { ...order, ...computeTotals(lines), lines, documents: data.documents || [] };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async findAll() {
    const { rows } = await pool.query(
      "SELECT * FROM delivery_orders ORDER BY created_at DESC"
    );
    const client = await pool.connect();
    try {
      const result = [];
      for (const order of rows) {
        const lines = await fetchLines(client, order.id);
        result.push({ ...order, ...computeTotals(lines), lines });
      }
      return result;
    } finally {
      client.release();
    }
  },

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM delivery_orders WHERE id = $1",
      [id]
    );
    if (!rows[0]) return null;
    const client = await pool.connect();
    try {
      const lines = await fetchLines(client, id);
      const { rows: docs } = await client.query(
        "SELECT * FROM delivery_order_documents WHERE delivery_order_id = $1 ORDER BY uploaded_at",
        [id]
      );
      return { ...rows[0], ...computeTotals(lines), lines, documents: docs };
    } finally {
      client.release();
    }
  },

  async findByPartnerNo(partnerNo) {
    const { rows } = await pool.query(
      "SELECT * FROM delivery_orders WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo]
    );
    const client = await pool.connect();
    try {
      const result = [];
      for (const order of rows) {
        const lines = await fetchLines(client, order.id);
        result.push({ ...order, ...computeTotals(lines), lines });
      }
      return result;
    } finally {
      client.release();
    }
  },

  async findByStatus(status) {
    const { rows } = await pool.query(
      "SELECT * FROM delivery_orders WHERE status = $1 ORDER BY created_at DESC",
      [status]
    );
    const client = await pool.connect();
    try {
      const result = [];
      for (const order of rows) {
        const lines = await fetchLines(client, order.id);
        result.push({ ...order, ...computeTotals(lines), lines });
      }
      return result;
    } finally {
      client.release();
    }
  },

  async update(id, data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const r = await client.query(
        `UPDATE delivery_orders SET
           partner_no=$1, partner_name=$2, partner_type=$3, erp_po_nos=$4,
           delivery_date_time=$5, delivery_type=$6, direction=$7,
           shipment_date=$8, expected_delivery_date=$9, actual_delivery_date=$10,
           location_code=$11, warehouse_location=$12, carrier_name=$13, transport_mode=$14,
           total_amount=$15, currency_code=$16,
           ship_address=$17, ship_city=$18, ship_state=$19, ship_post_code=$20, ship_country_code=$21,
           status=$22, remarks=$23, updated_at=NOW()
         WHERE id=$24 RETURNING *`,
        [
          data.partnerNo,
          data.partnerName           || null,
          data.partnerType           || null,
          Array.isArray(data.erpPoNos) ? data.erpPoNos : [],
          data.deliveryDateTime      || null,
          data.deliveryType          || null,
          data.direction             || null,
          data.shipmentDate,
          data.expectedDeliveryDate  || null,
          data.actualDeliveryDate    || null,
          data.locationCode          || null,
          data.warehouseLocation     || null,
          data.carrierName           || null,
          data.transportMode         || null,
          data.totalAmount           || null,
          data.currencyCode          || null,
          data.shipAddress           || null,
          data.shipCity              || null,
          data.shipState             || null,
          data.shipPostCode          || null,
          data.shipCountryCode       || null,
          data.status                || "Created",
          data.remarks               || null,
          id,
        ]
      );
      const order = r.rows[0];

      await client.query(
        "DELETE FROM delivery_order_lines WHERE delivery_order_id = $1",
        [id]
      );
      const lines = await insertLines(client, id, data.lines || data.deliveryStagingsLine || []);

      await client.query("COMMIT");
      return { ...order, ...computeTotals(lines), lines };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      "UPDATE delivery_orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
    return rows[0] || null;
  },

  async updateBcSync(id, synced, errorMsg = null) {
    const { rows } = await pool.query(
      `UPDATE delivery_orders
         SET bc_synced=$1, bc_error=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [synced, synced ? null : errorMsg, id]
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rows } = await pool.query(
      "DELETE FROM delivery_orders WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = DeliveryOrder;
