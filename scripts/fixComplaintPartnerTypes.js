const { pool } = require("../config/db");

(async () => {
  try {
    console.log("Fixing invalid partnerType values in complaints...\n");

    // Find complaints with invalid partnerType
    const result = await pool.query(`
      SELECT id, partner_type, sender_id 
      FROM complaints 
      WHERE partner_type IS NULL 
         OR partner_type = '' 
         OR partner_type = ' ' 
         OR partner_type NOT IN ('Vendor', 'Customer')
    `);

    console.log(`Found ${result.rows.length} complaints with invalid partnerType\n`);

    if (result.rows.length === 0) {
      console.log("✅ No complaints need fixing");
      process.exit(0);
    }

    // Update each complaint
    for (const row of result.rows) {
      // Try to determine from sender_id if it starts with VEN or CUST
      let newPartnerType = "Vendor"; // Default
      if (row.sender_id) {
        if (row.sender_id.toUpperCase().startsWith("CUST")) {
          newPartnerType = "Customer";
        }
      }

      await pool.query(
        "UPDATE complaints SET partner_type = $1 WHERE id = $2",
        [newPartnerType, row.id]
      );

      console.log(`✅ Fixed complaint ${row.id}: ${row.partner_type} → ${newPartnerType}`);
    }

    console.log(`\n✅ Fixed ${result.rows.length} complaints`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
