require("dotenv").config();
const { pool } = require("../config/db");

async function addVendorInvoiceNoColumn() {
  try {
    console.log("Adding vendor_invoice_no column to purchase_invoices table...\n");

    await pool.query(`
      ALTER TABLE purchase_invoices
      ADD COLUMN IF NOT EXISTS vendor_invoice_no VARCHAR(50);
    `);

    console.log("✅ vendor_invoice_no column added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addVendorInvoiceNoColumn();
