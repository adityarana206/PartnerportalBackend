const { pool } = require("../config/db");

async function checkDatabaseHealth() {
  console.log("🔍 Checking database health...\n");

  const tables = [
    "bc_user_registrations",
    "bc_user_registration_contacts",
    "bc_user_registration_banks",
    "registration_invites",
    "countries",
    "currencies",
    "purchase_orders",
    "purchase_order_lines",
    "delivery_orders",
    "delivery_order_lines",
    "users",
    "items",
  ];

  const results = {
    existing: [],
    missing: [],
    errors: [],
  };

  for (const table of tables) {
    try {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );

      if (result.rows[0].exists) {
        // Get row count
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(countResult.rows[0].count);
        results.existing.push({ table, count });
        console.log(`✅ ${table.padEnd(35)} - ${count} rows`);
      } else {
        results.missing.push(table);
        console.log(`❌ ${table.padEnd(35)} - MISSING`);
      }
    } catch (error) {
      results.errors.push({ table, error: error.message });
      console.log(`⚠️  ${table.padEnd(35)} - ERROR: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary:");
  console.log(`   Existing tables: ${results.existing.length}`);
  console.log(`   Missing tables:  ${results.missing.length}`);
  console.log(`   Errors:          ${results.errors.length}`);

  if (results.missing.length > 0) {
    console.log("\n⚠️  Missing tables:");
    results.missing.forEach((table) => console.log(`   - ${table}`));
    console.log("\n💡 Run the appropriate migration scripts to create missing tables.");
  }

  if (results.errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    results.errors.forEach(({ table, error }) => {
      console.log(`   - ${table}: ${error}`);
    });
  }

  await pool.end();
}

checkDatabaseHealth()
  .then(() => {
    console.log("\n✅ Health check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Health check failed:", error);
    process.exit(1);
  });
