const { pool } = require("../config/db");

async function createRegistrationInvitesTable() {
  const client = await pool.connect();
  
  try {
    console.log("🔧 Creating registration_invites table...\n");
    
    await client.query("BEGIN");

    // Check if table already exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registration_invites'
      )
    `);

    if (tableCheck.rows[0].exists) {
      console.log("✅ Table registration_invites already exists");
      await client.query("COMMIT");
      return;
    }

    // Create registration_invites table
    await client.query(`
      CREATE TABLE registration_invites (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        partner_no VARCHAR(50),
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("✅ Table registration_invites created successfully");

    // Create index on token for faster lookups
    await client.query(`
      CREATE INDEX idx_registration_invites_token ON registration_invites(token)
    `);

    console.log("✅ Index created on token column");

    // Create index on expires_at for cleanup queries
    await client.query(`
      CREATE INDEX idx_registration_invites_expires_at ON registration_invites(expires_at)
    `);

    console.log("✅ Index created on expires_at column");

    await client.query("COMMIT");

    console.log("\n" + "=".repeat(60));
    console.log("✅ Registration invites table setup completed successfully");
    console.log("=".repeat(60));

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\n❌ Error creating registration_invites table:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
createRegistrationInvitesTable()
  .then(() => {
    console.log("\n✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
