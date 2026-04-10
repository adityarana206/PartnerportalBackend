const { pool } = require("../config/db");

async function addSalesShipmentRelations() {
  const client = await pool.connect();
  try {
    console.log("🔄 Adding foreign key relations to sales_shipments...");

    // Add foreign key for partner_no to users table
    await client.query(`
      ALTER TABLE sales_shipments
      DROP CONSTRAINT IF EXISTS fk_sales_shipments_partner_no;
    `);
    
    await client.query(`
      ALTER TABLE sales_shipments
      ADD CONSTRAINT fk_sales_shipments_partner_no
      FOREIGN KEY (partner_no) REFERENCES users(ref_no)
      ON DELETE RESTRICT;
    `);
    console.log("✅ Added foreign key: partner_no -> users(ref_no)");

    // Note: location_code has duplicate values in partner_location_links
    // Skipping foreign key constraint for location_code
    console.log("⚠️  Skipped location_code foreign key (duplicate values exist)");

    // Add foreign key for ship_to_code to users table
    await client.query(`
      ALTER TABLE sales_shipments
      DROP CONSTRAINT IF EXISTS fk_sales_shipments_ship_to_code;
    `);
    
    await client.query(`
      ALTER TABLE sales_shipments
      ADD CONSTRAINT fk_sales_shipments_ship_to_code
      FOREIGN KEY (ship_to_code) REFERENCES users(ref_no)
      ON DELETE RESTRICT;
    `);
    console.log("✅ Added foreign key: ship_to_code -> users(ref_no)");

    console.log("\n🎉 Foreign key relations added successfully!");
  } catch (error) {
    console.error("❌ Error adding relations:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  addSalesShipmentRelations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = addSalesShipmentRelations;
