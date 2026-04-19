const { pool } = require("../config/db");

async function createDeliveryOrderTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_orders (
        id                     SERIAL PRIMARY KEY,
        delivery_order_no      VARCHAR(50) UNIQUE NOT NULL,
        partner_no             VARCHAR(50) NOT NULL,
        partner_name           VARCHAR(255),
        erp_po_nos             JSONB,
        shipment_date          DATE NOT NULL,
        expected_delivery_date DATE,
        actual_delivery_date   DATE,
        location_code          VARCHAR(50),
        carrier_name           VARCHAR(100),
        transport_mode         VARCHAR(50),
        status                 VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft','Submitted','In Transit','Delivered')),
        remarks                TEXT,
        created_by             INTEGER,
        created_at             TIMESTAMP DEFAULT NOW(),
        updated_at             TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ delivery_orders table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_order_lines (
        id               SERIAL PRIMARY KEY,
        delivery_order_id INTEGER NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
        line_no          INTEGER NOT NULL,
        po_id            INTEGER,
        po_line_id       INTEGER,
        item_no          VARCHAR(50) NOT NULL,
        variant_code     VARCHAR(50),
        description      TEXT NOT NULL,
        order_qty        DECIMAL(10,2) NOT NULL DEFAULT 0,
        to_be_shipped    DECIMAL(10,2) NOT NULL DEFAULT 0,
        remaining        DECIMAL(10,2) NOT NULL DEFAULT 0,
        unit_of_measure  VARCHAR(20) NOT NULL,
        lot_no           VARCHAR(50),
        serial_no        VARCHAR(50),
        created_at       TIMESTAMP DEFAULT NOW(),
        updated_at       TIMESTAMP DEFAULT NOW(),
        UNIQUE(delivery_order_id, line_no)
      );
    `);
    console.log("✅ delivery_order_lines table created");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_do_partner_no  ON delivery_orders(partner_no);
      CREATE INDEX IF NOT EXISTS idx_do_status      ON delivery_orders(status);
      CREATE INDEX IF NOT EXISTS idx_dol_do_id      ON delivery_order_lines(delivery_order_id);
    `);
    console.log("✅ Indexes created");

    // Seed DO number series if not present
    await client.query(`
      INSERT INTO no_series (code, description, starting_no, ending_no, last_no_used, increment_by_no, allow_gaps, date_order)
      VALUES ('DO','Delivery Order Number Series',1,999999,0,1,false,false)
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log("✅ DO number series seeded");

    console.log("🎉 Delivery order tables ready!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createDeliveryOrderTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createDeliveryOrderTables;
