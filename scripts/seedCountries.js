const { pool } = require("../config/db");

const countries = [
  { code: "AD", name: "Andorra" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "AL", name: "Albania" },
  { code: "AM", name: "Armenia" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AT", name: "Austria" },
  { code: "AU", name: "Australia" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "BH", name: "Bahrain" },
  { code: "BM", name: "Bermuda" },
  { code: "BN", name: "Brunei Darussalam" },
  { code: "BO", name: "Bolivia" },
  { code: "BR", name: "Brazil" },
  { code: "BS", name: "Bahamas" },
  { code: "BW", name: "Botswana" },
  { code: "CA", name: "Canada" },
  { code: "CH", name: "Switzerland" },
  { code: "CL", name: "Chile" },
  { code: "CM", name: "Cameroon" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DE", name: "Germany" },
  { code: "DK", name: "Denmark" },
  { code: "DO", name: "Dominican Republic" },
  { code: "DZ", name: "Algeria" },
  { code: "EC", name: "Ecuador" },
  { code: "EE", name: "Estonia" },
  { code: "EG", name: "Egypt" },
  { code: "EL", name: "Greece" },
  { code: "ES", name: "Spain" },
  { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" },
  { code: "FJ", name: "Fiji Islands" },
  { code: "FO", name: "Faroe Islands" },
  { code: "FR", name: "France" },
  { code: "GB", name: "Great Britain" },
  { code: "GE", name: "Georgia" },
  { code: "GG", name: "Guernsey" },
  { code: "GH", name: "Ghana" },
  { code: "GL", name: "Greenland" },
  { code: "GT", name: "Guatemala" },
  { code: "HK", name: "Hong Kong" },
  { code: "HN", name: "Honduras" },
  { code: "HR", name: "Croatia" },
  { code: "HU", name: "Hungary" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IM", name: "Isle of Man" },
  { code: "IN", name: "India" },
  { code: "IS", name: "Iceland" },
  { code: "IT", name: "Italy" },
  { code: "JE", name: "Jersey" },
  { code: "JM", name: "Jamaica" },
  { code: "JO", name: "Jordan" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "KH", name: "Cambodia" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KY", name: "Cayman Islands" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "LB", name: "Lebanon" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LK", name: "Sri Lanka" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "LV", name: "Latvia" },
  { code: "MA", name: "Morocco" },
  { code: "MC", name: "Monaco" },
  { code: "ME", name: "Montenegro" },
  { code: "MG", name: "Madagascar" },
  { code: "MK", name: "North Macedonia" },
  { code: "MN", name: "Mongolia" },
  { code: "MO", name: "Macao" },
  { code: "MT", name: "Malta" },
  { code: "MU", name: "Mauritius" },
  { code: "MV", name: "Maldives" },
  { code: "MW", name: "Malawi" },
  { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" },
  { code: "MZ", name: "Mozambique" },
  { code: "NA", name: "Namibia" },
  { code: "NG", name: "Nigeria" },
  { code: "NI", name: "Northern Ireland" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "NP", name: "Nepal" },
  { code: "NZ", name: "New Zealand" },
  { code: "OM", name: "Oman" },
  { code: "PA", name: "Panama" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" },
  { code: "PL", name: "Poland" },
  { code: "PR", name: "Puerto Rico" },
  { code: "PT", name: "Portugal" },
  { code: "PY", name: "Paraguay" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RS", name: "Serbia" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SE", name: "Sweden" },
  { code: "SG", name: "Singapore" },
  { code: "SI", name: "Slovenia" },
  { code: "SK", name: "Slovakia" },
  { code: "SM", name: "San Marino" },
  { code: "SN", name: "Senegal" },
  { code: "ST", name: "São Tomé and Príncipe" },
  { code: "SV", name: "El Salvador" },
  { code: "SZ", name: "Swaziland" },
  { code: "TH", name: "Thailand" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Türkiye" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TW", name: "Taiwan" },
  { code: "TZ", name: "Tanzania" },
  { code: "UA", name: "Ukraine" },
  { code: "UG", name: "Uganda" },
  { code: "US", name: "USA" },
  { code: "UY", name: "Uruguay" },
  { code: "VG", name: "British Virgin Islands" },
  { code: "VN", name: "Vietnam" },
  { code: "VU", name: "Vanuatu" },
  { code: "WS", name: "Samoa" },
  { code: "XK", name: "Kosovo" },
  { code: "ZA", name: "South Africa" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

async function seedCountries() {
  const client = await pool.connect();
  
  try {
    console.log("🌍 Starting countries seed...\n");
    
    await client.query("BEGIN");

    // Check if countries table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'countries'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("❌ Countries table does not exist. Creating table...\n");
      
      await client.query(`
        CREATE TABLE countries (
          id SERIAL PRIMARY KEY,
          code VARCHAR(10) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log("✅ Countries table created\n");
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const country of countries) {
      try {
        // Try to insert, if exists then update
        const result = await client.query(
          `INSERT INTO countries (code, name, is_active) 
           VALUES ($1, $2, true) 
           ON CONFLICT (code) 
           DO UPDATE SET 
             name = EXCLUDED.name,
             updated_at = NOW()
           RETURNING (xmax = 0) AS inserted`,
          [country.code, country.name]
        );

        if (result.rows[0].inserted) {
          inserted++;
          console.log(`✅ Inserted: ${country.code} - ${country.name}`);
        } else {
          updated++;
          console.log(`🔄 Updated: ${country.code} - ${country.name}`);
        }
      } catch (err) {
        skipped++;
        console.log(`⚠️  Skipped: ${country.code} - ${country.name} (${err.message})`);
      }
    }

    await client.query("COMMIT");

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary:");
    console.log(`   Total countries: ${countries.length}`);
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log("=".repeat(60));

    // Verify count
    const countResult = await client.query("SELECT COUNT(*) FROM countries");
    console.log(`\n✅ Total countries in database: ${countResult.rows[0].count}`);

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\n❌ Error seeding countries:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed
seedCountries()
  .then(() => {
    console.log("\n✅ Countries seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Countries seed failed:", error);
    process.exit(1);
  });
