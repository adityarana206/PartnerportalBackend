const { pool } = require("./config/db");

async function testSync() {
  try {
    console.log("Testing sync...");
    
    // Test 1: Get all tables
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    const result = await pool.query(query);
    console.log("Found tables:", result.rows.length);
    console.log("Tables:", result.rows.map(r => r.table_name));
    
    // Test 2: Try to insert one
    const testTable = result.rows[0].table_name;
    const screenCode = testTable.toUpperCase();
    const screenName = testTable.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    console.log("\nTesting insert for:", testTable);
    console.log("Screen code:", screenCode);
    console.log("Screen name:", screenName);
    
    const insertQuery = `
      INSERT INTO screens (screen_name, screen_code, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (screen_code) DO NOTHING
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [
      screenName,
      screenCode,
      `Auto-generated from table: ${testTable}`
    ]);
    
    console.log("Insert result:", insertResult.rows);
    
    await pool.end();
    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    await pool.end();
    process.exit(1);
  }
}

testSync();
