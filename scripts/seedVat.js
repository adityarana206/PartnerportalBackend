require("dotenv").config();
const { pool } = require("../config/db");

const vatData = [
  { vatCode: "VAT0", description: "Zero Rated VAT", vatPercent: 0, vatType: "Zero Rated" },
  { vatCode: "VAT5", description: "5% VAT", vatPercent: 5, vatType: "Standard" },
];

const seedVat = async () => {
  try {
    for (const vat of vatData) {
      const existing = await pool.query(
        "SELECT id FROM vat_masters WHERE vat_code = $1",
        [vat.vatCode]
      );
      if (existing.rows.length > 0) {
        console.log(`⚠️  Skipped (already exists): ${vat.vatCode}`);
        continue;
      }
      await pool.query(
        `INSERT INTO vat_masters (vat_code, description, vat_percent, vat_type, status)
         VALUES ($1, $2, $3, $4, 'Active')`,
        [vat.vatCode, vat.description, vat.vatPercent, vat.vatType]
      );
      console.log(`✅ Seeded: ${vat.vatCode} (${vat.vatPercent}%)`);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedVat();
