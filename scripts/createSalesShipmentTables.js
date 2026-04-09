const { pool } = require("../config/db");

async function createSalesShipmentTables() {
  const client = await pool.connect();
  try {
    console.log("🔄 Creating sales shipment tables...");

    // Create sales_shipments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_shipments (
        id SERIAL PRIMARY KEY,
        portal_document_no VARCHAR(50) UNIQUE NOT NULL,
        shipment_no VARCHAR(50) NOT NULL,
        delivery_type VARCHAR(50) DEFAULT 'Shipment',
        partner_no VARCHAR(50) NOT NULL,
        partner_type VARCHAR(50) DEFAULT 'Customer',
        linked_order_no VARCHAR(50),
        tracking_no VARCHAR(100),
        carrier_code VARCHAR(50),
        shipment_date DATE NOT NULL,
        expected_delivery_date DATE,
        location_code VARCHAR(50),
        ship_to_code VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Inserted',
        direction VARCHAR(100) DEFAULT 'BC_x002D_to_x002D_Portal',
        bc_document_no VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ sales_shipments table created");

    // Create sales_shipment_lines table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_shipment_lines (
        id SERIAL PRIMARY KEY,
        shipment_id INTEGER NOT NULL REFERENCES sales_shipments(id) ON DELETE CASCADE,
        line_no INTEGER NOT NULL,
        item_no VARCHAR(50) NOT NULL,
        description TEXT,
        expiration_date DATE,
        lot_no VARCHAR(50),
        ordered_quantity DECIMAL(10,2) DEFAULT 0,
        remaining_quantity DECIMAL(10,2) DEFAULT 0,
        serial_no VARCHAR(50),
        shipped_quantity DECIMAL(10,2) DEFAULT 0,
        unit_of_measure_code VARCHAR(20),
        variant_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(shipment_id, line_no)
      );
    `);
    console.log("✅ sales_shipment_lines table created");

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sales_shipments_partner_no ON sales_shipments(partner_no);
      CREATE INDEX IF NOT EXISTS idx_sales_shipments_shipment_no ON sales_shipments(shipment_no);
      CREATE INDEX IF NOT EXISTS idx_sales_shipments_status ON sales_shipments(status);
      CREATE INDEX IF NOT EXISTS idx_sales_shipment_lines_shipment_id ON sales_shipment_lines(shipment_id);
    `);
    console.log("✅ Indexes created");

    console.log("🎉 Sales shipment tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createSalesShipmentTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createSalesShipmentTables;
