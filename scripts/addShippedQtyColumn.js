const { pool } = require("../config/db");

async function addShippedQtyColumn() {
  const client = await pool.connect();
  try {
    console.log("🔄 Adding shipped_qty column to purchase_order_lines...");

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchase_order_lines' 
      AND column_name = 'shipped_qty'
    `);

    if (checkColumn.rows.length > 0) {
      console.log("✅ Column shipped_qty already exists");
      return;
    }

    // Add shipped_qty column
    await client.query(`
      ALTER TABLE purchase_order_lines 
      ADD COLUMN shipped_qty NUMERIC(38, 20) DEFAULT 0 NOT NULL
    `);

    console.log("✅ Successfully added shipped_qty column");

    // Update existing records to set shipped_qty = 0
    await client.query(`
      UPDATE purchase_order_lines 
      SET shipped_qty = 0 
      WHERE shipped_qty IS NULL
    `);

    console.log("✅ Initialized shipped_qty for existing records");

  } catch (error) {
    console.error("❌ Error adding shipped_qty column:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
addShippedQtyColumn()
  .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
