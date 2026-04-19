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
  for (const line of lines) {
    const r = await client.query(
      `INSERT INTO delivery_order_lines (
         delivery_order_id, line_no, po_id, po_line_id,
         item_no, variant_code, description,
         order_qty, to_be_shipped, remaining,
         unit_of_measure, lot_no, serial_no
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        deliveryOrderId,
        line.lineNo,
        line.poId       || null,
        line.poLineId   || null,
        line.itemNo,
        line.variantCode  || null,
        line.description,
        line.orderQty     || 0,
        line.toBeShipped  || 0,
        line.remaining    || 0,
        line.unitOfMeasure,
        line.lotNo        || null,
        line.serialNo     || null,
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

      const doNo = await NoSeries.getNextNumberByCode("DO");

      const r = await client.query(
        `INSERT INTO delivery_orders (
           delivery_order_no, partner_no, partner_name, erp_po_nos,
           shipment_date, expected_delivery_date, actual_delivery_date,
           location_code, carrier_name, transport_mode,
           status, remarks, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [
          doNo,
          data.partnerNo,
          data.partnerName           || null,
          JSON.stringify(data.erpPoNos || []),
          data.shipmentDate,
          data.expectedDeliveryDate  || null,
          data.actualDeliveryDate    || null,
          data.locationCode          || null,
          data.carrierName           || null,
          data.transportMode         || null,
          data.status                || "Draft",
          data.remarks               || null,
          userId                     || null,
        ]
      );
      const order = r.rows[0];
      const lines = await insertLines(client, order.id, data.lines || []);

      await client.query("COMMIT");
      return { ...order, ...computeTotals(lines), lines };
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
      return { ...rows[0], ...computeTotals(lines), lines };
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
           partner_no=$1, partner_name=$2, erp_po_nos=$3,
           shipment_date=$4, expected_delivery_date=$5, actual_delivery_date=$6,
           location_code=$7, carrier_name=$8, transport_mode=$9,
           status=$10, remarks=$11, updated_at=NOW()
         WHERE id=$12 RETURNING *`,
        [
          data.partnerNo,
          data.partnerName           || null,
          JSON.stringify(data.erpPoNos || []),
          data.shipmentDate,
          data.expectedDeliveryDate  || null,
          data.actualDeliveryDate    || null,
          data.locationCode          || null,
          data.carrierName           || null,
          data.transportMode         || null,
          data.status                || "Draft",
          data.remarks               || null,
          id,
        ]
      );
      const order = r.rows[0];

      await client.query(
        "DELETE FROM delivery_order_lines WHERE delivery_order_id = $1",
        [id]
      );
      const lines = await insertLines(client, id, data.lines || []);

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

  async delete(id) {
    const { rows } = await pool.query(
      "DELETE FROM delivery_orders WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = DeliveryOrder;
