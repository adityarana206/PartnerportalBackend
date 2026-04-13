const { pool } = require("../config/db");

const units = [
  { code: "BAG",      description: "Bag",            international_standard_code: null },
  { code: "BDL",      description: "Bundle",         international_standard_code: null },
  { code: "BIB",      description: "Bag-in-Box",     international_standard_code: null },
  { code: "BOX",      description: "Box",            international_standard_code: null },
  { code: "BTL",      description: "Bottle",         international_standard_code: null },
  { code: "CAN",      description: "Can",            international_standard_code: null },
  { code: "CASE",     description: "Case",           international_standard_code: null },
  { code: "CM",       description: "Centimeter",     international_standard_code: "CM" },
  { code: "CTN",      description: "Carton",         international_standard_code: null },
  { code: "DAY",      description: "Day",            international_standard_code: "DAY" },
  { code: "GAL",      description: "Gallon",         international_standard_code: null },
  { code: "GM",       description: "Grams",          international_standard_code: null },
  { code: "GR",       description: "Gram",           international_standard_code: "GRM" },
  { code: "HOUR",     description: "Hour",           international_standard_code: "HUR" },
  { code: "KG",       description: "Kilogram",       international_standard_code: null },
  { code: "KM",       description: "Kilometer",      international_standard_code: "KMT" },
  { code: "KWH",      description: "KW Hour",        international_standard_code: "KWH" },
  { code: "L",        description: "Liter",          international_standard_code: "LTR" },
  { code: "LBS",      description: "Pound",          international_standard_code: null },
  { code: "LRT",      description: null,             international_standard_code: null },
  { code: "LTR",      description: "Litre",          international_standard_code: null },
  { code: "M3",       description: "Cubic metre",    international_standard_code: "M3" },
  { code: "MILES",    description: "Miles",          international_standard_code: "1A" },
  { code: "ML",       description: "MilliLiter",     international_standard_code: null },
  { code: "MT",       description: "Meter",          international_standard_code: null },
  { code: "PACK",     description: "Pack",           international_standard_code: null },
  { code: "PAD",      description: "Pad",            international_standard_code: null },
  { code: "PAGE",     description: "Page",           international_standard_code: null },
  { code: "PAIR",     description: "Pair",           international_standard_code: null },
  { code: "PALLET",   description: "Pallet",         international_standard_code: "PF" },
  { code: "PCS",      description: "Pieces (Each)",  international_standard_code: null },
  { code: "PKT",      description: "Packet",         international_standard_code: null },
  { code: "PRINTING", description: "Printing",       international_standard_code: null },
  { code: "ROLL",     description: "Roll",           international_standard_code: null },
  { code: "SERVE",    description: "Serve",          international_standard_code: null },
  { code: "SET",      description: "Set",            international_standard_code: null },
  { code: "SHEET",    description: "Sheets",         international_standard_code: null },
  { code: "SLICE",    description: "Slice",          international_standard_code: null },
  { code: "T",        description: "Tonne",          international_standard_code: "TN" },
  { code: "TIN",      description: "Tin",            international_standard_code: null },
  { code: "TRAY",     description: "Tray",           international_standard_code: null },
  { code: "TUB",      description: "Tub",            international_standard_code: null },
  { code: "UNIT",     description: "Unit",           international_standard_code: null },
];

async function seed() {
  try {
    await pool.query(`
      ALTER TABLE unit_of_measures
      ADD COLUMN IF NOT EXISTS international_standard_code VARCHAR(10)
    `);

    for (const u of units) {
      await pool.query(
        `INSERT INTO unit_of_measures (code, description, international_standard_code)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO UPDATE
           SET description = EXCLUDED.description,
               international_standard_code = EXCLUDED.international_standard_code,
               updated_at = NOW()`,
        [u.code, u.description, u.international_standard_code]
      );
    }

    console.log(`✅ Seeded ${units.length} units of measure`);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await pool.end();
  }
}

seed();
