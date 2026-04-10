const { pool } = require("../config/db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function makeSuperAdmin() {
  try {
    console.log("🔧 Make User Super Admin\n");
    console.log("This will grant super admin privileges to a user,");
    console.log("bypassing all permission checks.\n");

    // Get email from user
    rl.question("Enter user email: ", async (email) => {
      if (!email) {
        console.log("❌ Email is required");
        rl.close();
        await pool.end();
        return;
      }

      try {
        // Check if user exists
        const userCheck = await pool.query(
          "SELECT id, name, email, role FROM users WHERE email = $1",
          [email]
        );

        if (userCheck.rows.length === 0) {
          console.log(`\n❌ User with email "${email}" not found`);
          rl.close();
          await pool.end();
          return;
        }

        const user = userCheck.rows[0];
        console.log(`\n👤 Found user:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Current Role: ${user.role}`);

        if (user.role === "super_admin") {
          console.log(`\n✅ User is already a super admin!`);
          rl.close();
          await pool.end();
          return;
        }

        // Update to super admin
        const updateResult = await pool.query(
          "UPDATE users SET role = 'super_admin' WHERE id = $1 RETURNING *",
          [user.id]
        );

        console.log(`\n✅ Successfully updated user to super_admin!`);
        console.log(`\n📋 Updated user:`);
        console.log(`   Name: ${updateResult.rows[0].name}`);
        console.log(`   Email: ${updateResult.rows[0].email}`);
        console.log(`   New Role: ${updateResult.rows[0].role}`);
        console.log(`\n💡 The user now has full access to all features.`);
        console.log(`   They may need to logout and login again for changes to take effect.`);

        rl.close();
        await pool.end();
      } catch (error) {
        console.error(`\n❌ Error:`, error.message);
        rl.close();
        await pool.end();
      }
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    await pool.end();
  }
}

makeSuperAdmin();
