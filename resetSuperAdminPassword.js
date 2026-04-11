require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

const resetPassword = async () => {
  try {
    const hashedPassword = await bcrypt.hash("itsecurePassword", 10);
    const result = await pool.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE role = 'super_admin' RETURNING id, name, email, role",
      [hashedPassword]
    );

    if (result.rows.length === 0) {
      console.log("❌ No super admin found");
      process.exit(1);
    }

    console.log("✅ Password reset successfully for:", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

resetPassword();
