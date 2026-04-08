const { pool } = require("../config/db");
const NoSeries = require("../models/NoSeris.model");

async function updateItemRequestsTable() {
  const client = await pool.connect();
  try {
    console.log("🔄 Updating item_requests table...");

    // Add new columns
    await client.query(`
      ALTER TABLE item_requests 
      ADD COLUMN IF NOT EXISTS partner_portal_no VARCHAR(50),
      ADD COLUMN IF NOT EXISTS variant_code VARCHAR(50);
    `);
    console.log("✅ Added partner_portal_no and variant_code columns");

    // Check if there are existing rows
    const countResult = await client.query("SELECT COUNT(*) FROM item_requests");
    const rowCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Found ${rowCount} existing rows`);

    if (rowCount > 0) {
      // Update existing rows with generated partner_portal_no
      const existingRows = await client.query(
        "SELECT id, partner_no, batch_no FROM item_requests WHERE partner_portal_no IS NULL"
      );
      
      console.log(`🔄 Updating ${existingRows.rows.length} rows with partner_portal_no...`);
      
      for (const row of existingRows.rows) {
        const portalNo = await NoSeries.getNextNumberByCode("PORTAL");
        await client.query(
          "UPDATE item_requests SET partner_portal_no = $1 WHERE id = $2",
          [portalNo, row.id]
        );
      }
      console.log("✅ Updated existing rows with partner_portal_no");
    }

    // Ensure batch_no is not null (generate from id if needed)
    await client.query(`
      UPDATE item_requests 
      SET batch_no = 'BATCH' || id::text
      WHERE batch_no IS NULL;
    `);
    console.log("✅ Ensured batch_no is not null");

    // Drop foreign key constraint temporarily
    await client.query(`
      ALTER TABLE item_requests DROP CONSTRAINT IF EXISTS fk_item_partner_no;
    `);
    console.log("✅ Dropped foreign key constraint");

    // Set default value for NULL partner_no
    await client.query(`
      UPDATE item_requests 
      SET partner_no = 'DEFAULT'
      WHERE partner_no IS NULL;
    `);
    console.log("✅ Set default value for NULL partner_no");

    // Drop existing primary key
    await client.query(`
      ALTER TABLE item_requests DROP CONSTRAINT IF EXISTS item_requests_pkey;
    `);
    console.log("✅ Dropped old primary key");

    // Add NOT NULL constraints
    await client.query(`
      ALTER TABLE item_requests 
      ALTER COLUMN partner_portal_no SET NOT NULL,
      ALTER COLUMN partner_no SET NOT NULL,
      ALTER COLUMN batch_no SET NOT NULL;
    `);
    console.log("✅ Added NOT NULL constraints");

    // Add composite primary key
    await client.query(`
      ALTER TABLE item_requests 
      ADD PRIMARY KEY (partner_portal_no, partner_no, batch_no);
    `);
    console.log("✅ Added composite primary key (partner_portal_no, partner_no, batch_no)");

    // Recreate foreign key constraint (optional - can be added later if needed)
    // await client.query(`
    //   ALTER TABLE item_requests 
    //   ADD CONSTRAINT fk_item_partner_no 
    //   FOREIGN KEY (partner_no) REFERENCES users(ref_no);
    // `);
    // console.log("✅ Recreated foreign key constraint");

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_item_requests_partner_no ON item_requests(partner_no);
      CREATE INDEX IF NOT EXISTS idx_item_requests_batch_no ON item_requests(batch_no);
      CREATE INDEX IF NOT EXISTS idx_item_requests_status ON item_requests(status);
    `);
    console.log("✅ Created indexes");

    console.log("🎉 Table update complete!");

  } catch (error) {
    console.error("❌ Error updating table:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  updateItemRequestsTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = updateItemRequestsTable;
