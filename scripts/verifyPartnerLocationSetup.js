const { pool } = require("../config/db");

async function verifyPartnerLocationSetup() {
  const client = await pool.connect();
  try {
    console.log("🔍 Verifying partner_location_links setup...\n");

    // 1. Check if table exists
    console.log("1️⃣ Checking if table exists...");
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'partner_location_links'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log("❌ Table 'partner_location_links' does not exist!");
      console.log("Creating table...\n");
      
      await client.query(`
        CREATE TABLE partner_location_links (
          id SERIAL PRIMARY KEY,
          partner_type VARCHAR(50),
          partner_no VARCHAR(100),
          description TEXT,
          address_code VARCHAR(100),
          address_name VARCHAR(255),
          location_code VARCHAR(100),
          address TEXT,
          address2 TEXT,
          city VARCHAR(100),
          post_code VARCHAR(20),
          country_region_code VARCHAR(10),
          contact VARCHAR(255),
          phone_no VARCHAR(50),
          is_default BOOLEAN DEFAULT false,
          blocked BOOLEAN DEFAULT false,
          created_by INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log("✅ Table created successfully!\n");
    } else {
      console.log("✅ Table exists\n");
    }

    // 2. Check table structure
    console.log("2️⃣ Checking table structure...");
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'partner_location_links'
      ORDER BY ordinal_position;
    `);
    console.log("Columns:", columns.rows);
    console.log("");

    // 3. Check if screens table exists
    console.log("3️⃣ Checking screens table...");
    const screensCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'screens'
      );
    `);
    
    if (!screensCheck.rows[0].exists) {
      console.log("❌ Table 'screens' does not exist!");
      console.log("Creating screens table...\n");
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS screens (
          id SERIAL PRIMARY KEY,
          screen_name VARCHAR(255) UNIQUE NOT NULL,
          screen_code VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log("✅ Screens table created!\n");
    } else {
      console.log("✅ Screens table exists\n");
    }

    // 4. Check if PARTNER_LOCATION_LINKS screen exists
    console.log("4️⃣ Checking PARTNER_LOCATION_LINKS screen...");
    const screenExists = await client.query(`
      SELECT * FROM screens WHERE screen_code = 'PARTNER_LOCATION_LINKS';
    `);
    
    if (screenExists.rows.length === 0) {
      console.log("❌ Screen 'PARTNER_LOCATION_LINKS' not found!");
      console.log("Creating screen entry...\n");
      
      await client.query(`
        INSERT INTO screens (screen_name, screen_code, description)
        VALUES ('Partner Location Links', 'PARTNER_LOCATION_LINKS', 'Manage partner location links')
        ON CONFLICT (screen_code) DO NOTHING;
      `);
      
      console.log("✅ Screen created!\n");
    } else {
      console.log("✅ Screen exists:", screenExists.rows[0]);
      console.log("");
    }

    // 5. Check permissions table
    console.log("5️⃣ Checking permissions table...");
    const permissionsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'permissions'
      );
    `);
    
    if (!permissionsCheck.rows[0].exists) {
      console.log("❌ Table 'permissions' does not exist!");
      console.log("Creating permissions table...\n");
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS permissions (
          id SERIAL PRIMARY KEY,
          screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
          role VARCHAR(50) NOT NULL,
          can_read BOOLEAN DEFAULT false,
          can_write BOOLEAN DEFAULT false,
          can_modify BOOLEAN DEFAULT false,
          can_delete BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(screen_id, role)
        );
      `);
      
      console.log("✅ Permissions table created!\n");
    } else {
      console.log("✅ Permissions table exists\n");
    }

    // 6. Set default permissions for all roles
    console.log("6️⃣ Setting default permissions...");
    const screenId = await client.query(`
      SELECT id FROM screens WHERE screen_code = 'PARTNER_LOCATION_LINKS';
    `);
    
    if (screenId.rows.length > 0) {
      const roles = ['customer', 'vendor', 'customer_admin', 'vendor_admin', 'super_admin'];
      
      for (const role of roles) {
        await client.query(`
          INSERT INTO permissions (screen_id, role, can_read, can_write, can_modify, can_delete)
          VALUES ($1, $2, true, true, true, true)
          ON CONFLICT (screen_id, role) 
          DO UPDATE SET 
            can_read = true,
            can_write = true,
            can_modify = true,
            can_delete = true;
        `, [screenId.rows[0].id, role]);
        
        console.log(`✅ Permissions set for role: ${role}`);
      }
      console.log("");
    }

    // 7. Count records
    console.log("7️⃣ Checking data...");
    const count = await client.query(`
      SELECT COUNT(*) as total FROM partner_location_links;
    `);
    console.log(`Total records: ${count.rows[0].total}\n`);

    // 8. Sample data
    if (count.rows[0].total > 0) {
      console.log("8️⃣ Sample records:");
      const sample = await client.query(`
        SELECT location_code, address_name, city, is_default
        FROM partner_location_links
        LIMIT 5;
      `);
      console.table(sample.rows);
    }

    console.log("\n✅ Verification complete!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    client.release();
    process.exit(0);
  }
}

verifyPartnerLocationSetup();
