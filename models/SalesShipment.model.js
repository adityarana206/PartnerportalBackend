const { pool } = require("../config/db");

const SalesShipment = {
  async create(data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Insert shipment header
      const headerQuery = `
        INSERT INTO sales_shipments (
          portal_document_no, shipment_no, delivery_type, partner_no, partner_type,
          linked_order_no, tracking_no, carrier_code, shipment_date,
          expected_delivery_date, location_code, ship_to_code, status,
          direction, bc_document_no
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *;
      `;
      const headerValues = [
        data.portalDocumentNo,
        data.shipmentNo,
        data.deliveryType || "Shipment",
        data.partnerNo,
        data.partnerType || "Customer",
        data.linkedOrderNo || null,
        data.trackingNo || null,
        data.carrierCode || null,
        data.shipmentDate,
        data.expectedDeliveryDate || null,
        data.locationCode || null,
        data.shipToCode || null,
        data.status || "Inserted",
        data.direction || "BC_x002D_to_x002D_Portal",
        data.bcDocumentNo || null,
      ];
      const headerResult = await client.query(headerQuery, headerValues);
      const shipment = headerResult.rows[0];

      // Insert shipment lines
      if (data.deliveryStagingsLine && data.deliveryStagingsLine.length > 0) {
        for (const line of data.deliveryStagingsLine) {
          const lineQuery = `
            INSERT INTO sales_shipment_lines (
              shipment_id, line_no, item_no, description, expiration_date,
              lot_no, ordered_quantity, remaining_quantity, serial_no,
              shipped_quantity, unit_of_measure_code, variant_code
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12);
          `;
          const lineValues = [
            shipment.id,
            line.lineNo,
            line.itemNo,
            line.description || null,
            line.expirationDate || null,
            line.lotNo || null,
            line.orderedQuantity || 0,
            line.remainingQuantity || 0,
            line.serialNo || null,
            line.shippedQuantity || 0,
            line.unitOfMeasureCode || null,
            line.variantCode || null,
          ];
          await client.query(lineQuery, lineValues);
        }
      }

      await client.query("COMMIT");

      // Fetch complete shipment with lines
      return await this.findById(shipment.id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM sales_shipments ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const shipmentResult = await pool.query(
      "SELECT * FROM sales_shipments WHERE id = $1",
      [id]
    );
    if (shipmentResult.rows.length === 0) return null;

    const shipment = shipmentResult.rows[0];
    const linesResult = await pool.query(
      "SELECT * FROM sales_shipment_lines WHERE shipment_id = $1 ORDER BY line_no",
      [id]
    );

    return {
      ...shipment,
      deliveryStagingsLine: linesResult.rows,
    };
  },

  async findByPortalDocumentNo(portalDocumentNo) {
    const shipmentResult = await pool.query(
      "SELECT * FROM sales_shipments WHERE portal_document_no = $1",
      [portalDocumentNo]
    );
    if (shipmentResult.rows.length === 0) return null;

    const shipment = shipmentResult.rows[0];
    const linesResult = await pool.query(
      "SELECT * FROM sales_shipment_lines WHERE shipment_id = $1 ORDER BY line_no",
      [shipment.id]
    );

    return {
      ...shipment,
      deliveryStagingsLine: linesResult.rows,
    };
  },

  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM sales_shipments WHERE partner_no = $1 ORDER BY created_at DESC",
      [partnerNo]
    );
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE sales_shipments SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query("DELETE FROM sales_shipment_lines WHERE shipment_id = $1", [id]);
      const result = await client.query(
        "DELETE FROM sales_shipments WHERE id = $1 RETURNING *",
        [id]
      );

      await client.query("COMMIT");
      return result.rows[0] || null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = SalesShipment;
