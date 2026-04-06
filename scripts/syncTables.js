const { pool } = require("../config/db");

/**
 * Sync database tables to screens table
 * This script fetches all tables from the database and adds them to the screens table
 * if they don't already exist
 */
async function syncTables() {
  const client = await pool.connect();
  try {
    console.log("🔄 Starting table sync...");

    // Get all tables from the database (excluding system tables)
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('spatial_ref_sys')
      ORDER BY table_name;
    `;

    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows;

    console.log(`📊 Found ${tables.length} tables in database`);

    let addedCount = 0;
    let skippedCount = 0;

    // Insert each table into screens if it doesn't exist
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Check if screen already exists
      const checkQuery = `
        SELECT id FROM screens WHERE screen_code = $1;
      `;
      const checkResult = await client.query(checkQuery, [tableName]);

      if (checkResult.rows.length === 0) {
        // Convert table_name to readable format (e.g., 'sales_orders' -> 'Sales Orders')
        const screenName = tableName
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Insert new screen
        const insertQuery = `
          INSERT INTO screens (screen_name, screen_code, description)
          VALUES ($1, $2, $3)
          RETURNING id;
        `;
        
        await client.query(insertQuery, [
          screenName,
          tableName,
          `Auto-synced table: ${tableName}`
        ]);

        console.log(`  ✅ Added: ${screenName} (${tableName})`);
        addedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log("\n📈 Sync Summary:");
    console.log(`   ✅ Added: ${addedCount} new tables`);
    console.log(`   ⏭️  Skipped: ${skippedCount} existing tables`);
    console.log(`   📊 Total: ${tables.length} tables`);
    console.log("\n🎉 Table sync complete!");

    return {
      success: true,
      added: addedCount,
      skipped: skippedCount,
      total: tables.length
    };
  } catch (error) {
    console.error("❌ Error syncing tables:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  syncTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = syncTables;
