const { pool } = require("../config/db");
const jwt = require("jsonwebtoken");

async function debugUserPermissions() {
  try {
    // Get token from command line argument
    const token = process.argv[2];
    
    if (!token) {
      console.log("❌ Usage: node debugUserPermissions.js <token>");
      console.log("\n💡 Get your token from localStorage in browser:");
      console.log("   localStorage.getItem('partner_portal_token')");
      process.exit(1);
    }

    console.log("🔍 Debugging user permissions...\n");

    // Decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token is valid");
      console.log("📋 Decoded token:", JSON.stringify(decoded, null, 2));
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
      process.exit(1);
    }

    // Check if token is blacklisted
    const blacklisted = await pool.query(
      "SELECT * FROM blacklisted_tokens WHERE token = $1",
      [token]
    );
    
    if (blacklisted.rows.length > 0) {
      console.log("\n❌ Token is blacklisted!");
      console.log("   Blacklisted at:", blacklisted.rows[0].created_at);
      console.log("   Expires at:", blacklisted.rows[0].expires_at);
    } else {
      console.log("\n✅ Token is not blacklisted");
    }

    // Get user info
    const userResult = await pool.query(
      "SELECT id, name, email, role, ref_no FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      console.log("\n❌ User not found in database!");
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log("\n👤 User Info:");
    console.log("   ID:", user.id);
    console.log("   Name:", user.name);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);
    console.log("   Ref No:", user.ref_no);

    // Check permissions for key screens
    const screens = ['SALES_ORDERS', 'PURCHASE_ORDERS', 'INVOICES', 'PERMISSION_GROUPS'];
    
    console.log("\n🔐 Permissions Check:");
    
    for (const screenCode of screens) {
      const query = `
        SELECT 
          s.screen_name,
          s.screen_code,
          COALESCE(up.can_read, p.can_read, false) as can_read,
          COALESCE(up.can_write, p.can_write, false) as can_write,
          COALESCE(up.can_modify, p.can_modify, false) as can_modify,
          COALESCE(up.can_delete, p.can_delete, false) as can_delete
        FROM screens s
        LEFT JOIN users u ON u.id = $1
        LEFT JOIN permissions p ON s.id = p.screen_id AND p.role = u.role
        LEFT JOIN user_permissions up ON s.id = up.screen_id AND up.user_id = $1
        WHERE s.screen_code = $2
      `;
      
      const result = await pool.query(query, [user.id, screenCode]);
      
      if (result.rows.length > 0) {
        const perm = result.rows[0];
        console.log(`\n   ${perm.screen_name} (${perm.screen_code}):`);
        console.log(`      Read: ${perm.can_read ? '✅' : '❌'}`);
        console.log(`      Write: ${perm.can_write ? '✅' : '❌'}`);
        console.log(`      Modify: ${perm.can_modify ? '✅' : '❌'}`);
        console.log(`      Delete: ${perm.can_delete ? '✅' : '❌'}`);
      } else {
        console.log(`\n   ${screenCode}: ❌ Screen not found`);
      }
    }

    // Check if user is super admin
    if (user.role === 'super_admin') {
      console.log("\n⭐ User is SUPER ADMIN - has all permissions");
    }

    console.log("\n✅ Debug complete!");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

debugUserPermissions();
