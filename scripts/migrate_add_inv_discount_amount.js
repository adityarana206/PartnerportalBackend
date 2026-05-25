const { pool } = require("../config/db");

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log("Adding inv_discount_amount column to purchase_order_lines...");
    await client.query(`
      ALTER TABLE purchase_order_lines 
      ADD COLUMN IF NOT EXISTS inv_discount_amount NUMERIC(15,4) DEFAULT 0
    `);
    console.log("✅ Column added successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
