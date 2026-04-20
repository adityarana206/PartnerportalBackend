const { pool } = require("../config/db");

const countries = [
  { code: "AD", name: "Andorra", currency_code: "EUR" },
  { code: "AE", name: "United Arab Emirates", currency_code: "AED" },
  { code: "AL", name: "Albania", currency_code: "ALL" },
  { code: "AM", name: "Armenia", currency_code: "AMD" },
  { code: "AO", name: "Angola", currency_code: "AOA" },
  { code: "AR", name: "Argentina", currency_code: "ARS" },
  { code: "AT", name: "Austria", currency_code: "EUR" },
  { code: "AU", name: "Australia", currency_code: "AUD" },
  { code: "AZ", name: "Azerbaijan", currency_code: "AZN" },
  { code: "BA", name: "Bosnia and Herzegovina", currency_code: "BAM" },
  { code: "BD", name: "Bangladesh", currency_code: "BDT" },
  { code: "BE", name: "Belgium", currency_code: "EUR" },
  { code: "BG", name: "Bulgaria", currency_code: "BGN" },
  { code: "BH", name: "Bahrain", currency_code: "BHD" },
  { code: "BM", name: "Bermuda", currency_code: "BMD" },
  { code: "BN", name: "Brunei Darussalam", currency_code: "BND" },
  { code: "BO", name: "Bolivia", currency_code: "BOB" },
  { code: "BR", name: "Brazil", currency_code: "BRL" },
  { code: "BS", name: "Bahamas", currency_code: "BSD" },
  { code: "BW", name: "Botswana", currency_code: "BWP" },
  { code: "CA", name: "Canada", currency_code: "CAD" },
  { code: "CH", name: "Switzerland", currency_code: "CHF" },
  { code: "CL", name: "Chile", currency_code: "CLP" },
  { code: "CM", name: "Cameroon", currency_code: "XAF" },
  { code: "CN", name: "China", currency_code: "CNY" },
  { code: "CO", name: "Colombia", currency_code: "COP" },
  { code: "CR", name: "Costa Rica", currency_code: "CRC" },
  { code: "CY", name: "Cyprus", currency_code: "EUR" },
  { code: "CZ", name: "Czechia", currency_code: "CZK" },
  { code: "DE", name: "Germany", currency_code: "EUR" },
  { code: "DK", name: "Denmark", currency_code: "DKK" },
  { code: "DO", name: "Dominican Republic", currency_code: "DOP" },
  { code: "DZ", name: "Algeria", currency_code: "DZD" },
  { code: "EC", name: "Ecuador", currency_code: "USD" },
  { code: "EE", name: "Estonia", currency_code: "EUR" },
  { code: "EG", name: "Egypt", currency_code: "EGP" },
  { code: "EL", name: "Greece", currency_code: "EUR" },
  { code: "ES", name: "Spain", currency_code: "EUR" },
  { code: "ET", name: "Ethiopia", currency_code: "ETB" },
  { code: "FI", name: "Finland", currency_code: "EUR" },
  { code: "FJ", name: "Fiji Islands", currency_code: "FJD" },
  { code: "FO", name: "Faroe Islands", currency_code: "DKK" },
  { code: "FR", name: "France", currency_code: "EUR" },
  { code: "GB", name: "Great Britain", currency_code: "GBP" },
  { code: "GE", name: "Georgia", currency_code: "GEL" },
  { code: "GG", name: "Guernsey", currency_code: "GBP" },
  { code: "GH", name: "Ghana", currency_code: "GHS" },
  { code: "GL", name: "Greenland", currency_code: "DKK" },
  { code: "GT", name: "Guatemala", currency_code: "GTQ" },
  { code: "HK", name: "Hong Kong", currency_code: "HKD" },
  { code: "HN", name: "Honduras", currency_code: "HNL" },
  { code: "HR", name: "Croatia", currency_code: "EUR" },
  { code: "HU", name: "Hungary", currency_code: "HUF" },
  { code: "ID", name: "Indonesia", currency_code: "IDR" },
  { code: "IE", name: "Ireland", currency_code: "EUR" },
  { code: "IL", name: "Israel", currency_code: "ILS" },
  { code: "IM", name: "Isle of Man", currency_code: "GBP" },
  { code: "IN", name: "India", currency_code: "INR" },
  { code: "IS", name: "Iceland", currency_code: "ISK" },
  { code: "IT", name: "Italy", currency_code: "EUR" },
  { code: "JE", name: "Jersey", currency_code: "GBP" },
  { code: "JM", name: "Jamaica", currency_code: "JMD" },
  { code: "JO", name: "Jordan", currency_code: "JOD" },
  { code: "JP", name: "Japan", currency_code: "JPY" },
  { code: "KE", name: "Kenya", currency_code: "KES" },
  { code: "KH", name: "Cambodia", currency_code: "KHR" },
  { code: "KR", name: "South Korea", currency_code: "KRW" },
  { code: "KW", name: "Kuwait", currency_code: "KWD" },
  { code: "KY", name: "Cayman Islands", currency_code: "KYD" },
  { code: "KZ", name: "Kazakhstan", currency_code: "KZT" },
  { code: "LB", name: "Lebanon", currency_code: "LBP" },
  { code: "LI", name: "Liechtenstein", currency_code: "CHF" },
  { code: "LK", name: "Sri Lanka", currency_code: "LKR" },
  { code: "LT", name: "Lithuania", currency_code: "EUR" },
  { code: "LU", name: "Luxembourg", currency_code: "EUR" },
  { code: "LV", name: "Latvia", currency_code: "EUR" },
  { code: "MA", name: "Morocco", currency_code: "MAD" },
  { code: "MC", name: "Monaco", currency_code: "EUR" },
  { code: "ME", name: "Montenegro", currency_code: "EUR" },
  { code: "MG", name: "Madagascar", currency_code: "MGA" },
  { code: "MK", name: "North Macedonia", currency_code: "MKD" },
  { code: "MN", name: "Mongolia", currency_code: "MNT" },
  { code: "MO", name: "Macao", currency_code: "MOP" },
  { code: "MT", name: "Malta", currency_code: "EUR" },
  { code: "MU", name: "Mauritius", currency_code: "MUR" },
  { code: "MV", name: "Maldives", currency_code: "MVR" },
  { code: "MW", name: "Malawi", currency_code: "MWK" },
  { code: "MX", name: "Mexico", currency_code: "MXN" },
  { code: "MY", name: "Malaysia", currency_code: "MYR" },
  { code: "MZ", name: "Mozambique", currency_code: "MZN" },
  { code: "NA", name: "Namibia", currency_code: "NAD" },
  { code: "NG", name: "Nigeria", currency_code: "NGN" },
  { code: "NI", name: "Nothern Ireland", currency_code: "GBP" },
  { code: "NL", name: "Netherlands", currency_code: "EUR" },
  { code: "NO", name: "Norway", currency_code: "NOK" },
  { code: "NP", name: "Nepal", currency_code: "NPR" },
  { code: "NZ", name: "New Zealand", currency_code: "NZD" },
  { code: "OM", name: "Oman", currency_code: "OMR" },
  { code: "PA", name: "Panama", currency_code: "PAB" },
  { code: "PE", name: "Peru", currency_code: "PEN" },
  { code: "PH", name: "Philippines", currency_code: "PHP" },
  { code: "PK", name: "Pakistan", currency_code: "PKR" },
  { code: "PL", name: "Poland", currency_code: "PLN" },
  { code: "PR", name: "Puerto Rico", currency_code: "USD" },
  { code: "PT", name: "Portugal", currency_code: "EUR" },
  { code: "PY", name: "Paraguay", currency_code: "PYG" },
  { code: "QA", name: "Qatar", currency_code: "QAR" },
  { code: "RO", name: "Romania", currency_code: "RON" },
  { code: "RS", name: "Serbia", currency_code: "RSD" },
  { code: "RU", name: "Russia", currency_code: "RUB" },
  { code: "SA", name: "Saudi Arabia", currency_code: "SAR" },
  { code: "SB", name: "Solomon Islands", currency_code: "SBD" },
  { code: "SE", name: "Sweden", currency_code: "SEK" },
  { code: "SG", name: "Singapore", currency_code: "SGD" },
  { code: "SI", name: "Slovenia", currency_code: "EUR" },
  { code: "SK", name: "Slovakia", currency_code: "EUR" },
  { code: "SM", name: "San Marino", currency_code: "EUR" },
  { code: "SN", name: "Senegal", currency_code: "XOF" },
  { code: "ST", name: "São Tomé and Príncipe", currency_code: "STN" },
  { code: "SV", name: "El Salvador", currency_code: "USD" },
  { code: "SZ", name: "Swaziland", currency_code: "SZL" },
  { code: "TH", name: "Thailand", currency_code: "THB" },
  { code: "TN", name: "Tunisia", currency_code: "TND" },
  { code: "TR", name: "Türkiye", currency_code: "TRY" },
  { code: "TT", name: "Trinidad and Tobago", currency_code: "TTD" },
  { code: "TW", name: "Taiwan", currency_code: "TWD" },
  { code: "TZ", name: "Tanzania", currency_code: "TZS" },
  { code: "UA", name: "Ukraine", currency_code: "UAH" },
  { code: "UG", name: "Uganda", currency_code: "UGX" },
  { code: "US", name: "USA", currency_code: "USD" },
  { code: "UY", name: "Uruguay", currency_code: "UYU" },
  { code: "VG", name: "British Virgin Islands", currency_code: "USD" },
  { code: "VN", name: "Vietnam", currency_code: "VND" },
  { code: "VU", name: "Vanuatu", currency_code: "VUV" },
  { code: "WS", name: "Samoa", currency_code: "WST" },
  { code: "XK", name: "Kosovo", currency_code: "EUR" },
  { code: "ZA", name: "South Africa", currency_code: "ZAR" },
  { code: "ZM", name: "Zambia", currency_code: "ZMW" },
  { code: "ZW", name: "Zimbabwe", currency_code: "ZWL" },
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
          currency_code VARCHAR(10),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      console.log("✅ Countries table created\n");
    } else {
      // Add currency_code column if it doesn't exist
      await client.query(`
        ALTER TABLE countries
        ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10)
      `);
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const country of countries) {
      try {
        const result = await client.query(
          `INSERT INTO countries (code, name, currency_code, is_active)
           VALUES ($1, $2, $3, false)
           ON CONFLICT (code)
           DO UPDATE SET
             name = EXCLUDED.name,
             currency_code = EXCLUDED.currency_code,
             updated_at = NOW()
           RETURNING (xmax = 0) AS inserted`,
          [country.code, country.name, country.currency_code]
        );

        if (result.rows[0].inserted) {
          inserted++;
          console.log(`✅ Inserted: ${country.code} - ${country.name} (${country.currency_code})`);
        } else {
          updated++;
          console.log(`🔄 Updated: ${country.code} - ${country.name} (${country.currency_code})`);
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
