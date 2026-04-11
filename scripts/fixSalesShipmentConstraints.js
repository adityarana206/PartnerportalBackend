require("dotenv").config();
const { pool } = require("../config/db");

async function fixSalesShipmentConstraints() {
  try {
    console.log("Fixing sales_shipments foreign key constraints...\n");

    // Drop the problematic foreign key constraints
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

    // Recreate constraints with ON DELETE SET NULL to be more flexible
    await pool.query(`
      ALTER TABLE sales_shipments 
      ADD CONSTRAINT fk_sales_shipments_partner_no 
      FOREIGN KEY (partner_no) REFERENCES users(ref_no) 
      ON DELETE SET NULL;
    `);
    console.log("✅ Recreated fk_sales_shipments_partner_no with ON DELETE SET NULL");

    await pool.query(`
      ALTER TABLE sales_shipments 
      ADD CONSTRAINT fk_sales_shipments_ship_to_code 
      FOREIGN KEY (ship_to_code) REFERENCES users(ref_no) 
      ON DELETE SET NULL;
    `);
    console.log("✅ Recreated fk_sales_shipments_ship_to_code with ON DELETE SET NULL");

    console.log("\n✅ Foreign key constraints fixed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixSalesShipmentConstraints();
