const { pool } = require("../config/db");

async function createPurchaseItemRequestTable() {
  const client = await pool.connect();
  try {
    console.log("🔄 Creating purchase_item_requests table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_item_requests (
        id SERIAL PRIMARY KEY,
        batch_no VARCHAR(50) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        item_category_code VARCHAR(50),
        base_unit_of_measure VARCHAR(20),
        purch_unit_of_measure VARCHAR(20),
        net_weight DECIMAL(10,2),
        gross_weight DECIMAL(10,2),
        specifications TEXT,
        ingredients TEXT,
        allergen_declaration TEXT,
        shelf_life_days INTEGER DEFAULT 0,
        gtin VARCHAR(50),
        ean_code VARCHAR(50),
        upc_code VARCHAR(50),
        purchase_unit_price DECIMAL(10,2) DEFAULT 0,
        price_currency_code VARCHAR(10) DEFAULT 'AED',
        partner_no VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Submitted',
        rejection_reason TEXT,
        price_effective_date DATE,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Created purchase_item_requests table");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_purchase_item_requests_partner_no ON purchase_item_requests(partner_no);
      CREATE INDEX IF NOT EXISTS idx_purchase_item_requests_batch_no ON purchase_item_requests(batch_no);
      CREATE INDEX IF NOT EXISTS idx_purchase_item_requests_status ON purchase_item_requests(status);
    `);
    console.log("✅ Created indexes");

    console.log("🎉 Table creation complete!");
  } catch (error) {
    console.error("❌ Error creating table:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  createPurchaseItemRequestTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = createPurchaseItemRequestTable;
