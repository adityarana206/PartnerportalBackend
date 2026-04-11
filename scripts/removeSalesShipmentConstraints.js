require("dotenv").config();
const { pool } = require("../config/db");

async function removeSalesShipmentConstraints() {
  try {
    console.log("Removing sales_shipments foreign key constraints...\n");

    // Drop the foreign key constraints completely
    await pool.query(`
      ALTER TABLE sales_shipments 
      DROP CONSTRAINT IF EXISTS fk_sales_shipments_ship_to_code;
    `);
    console.log("✅ Dropped fk_sales_shipments_ship_to_code");

    await pool.query(`
      ALTER TABLE sales_shipments 
      DROP CONSTRAINT IF EXISTS fk_sales_shipments_partner_no;
    `);
    console.log("✅ Dropped fk_sales_shipments_partner_no");

    console.log("\n✅ Foreign key constraints removed successfully!");
    console.log("ℹ️  Note: partner_no and ship_to_code can now accept any values");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

removeSalesShipmentConstraints();
