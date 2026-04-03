const { pool } = require("../config/db");

const PARTNER_NO = "VEN000001";
const SERIES_CODE = "BATCH";

const categories = ["COFFEE", "TEA", "SPICES", "DAIRY", "GRAINS"];
const units = ["KG", "LTR", "PCS", "BOX", "BAG"];
const currencies = ["AED", "USD", "EUR"];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (let i = 0; i < 50; i++) {
      // atomic increment
      const seriesRes = await client.query(
        `UPDATE no_series SET last_no_used = last_no_used + increment_by_no, updated_at = NOW()
         WHERE code = $1 AND last_no_used < ending_no RETURNING code, last_no_used`,
        [SERIES_CODE]
      );
      if (!seriesRes.rows[0]) throw new Error("BATCH series exhausted");
      const { code, last_no_used } = seriesRes.rows[0];
      const batchNo = `${code}${String(last_no_used).padStart(6, "0")}`;

      const category = categories[i % categories.length];
      const unit = units[i % units.length];
      const currency = currencies[i % currencies.length];
      const itemName = `${category} Product ${i + 1}`;

      await client.query(
        `INSERT INTO item_requests (
          batch_no, item_name, description, item_category_code,
          base_unit_of_measure, net_weight, gross_weight,
          unit_price, price_currency_code, partner_no,
          status, block
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Approved',false)`,
        [
          batchNo,
          itemName,
          `Description for ${itemName}`,
          category,
          unit,
          (Math.random() * 10 + 0.5).toFixed(2),
          (Math.random() * 12 + 0.5).toFixed(2),
          (Math.random() * 100 + 5).toFixed(2),
          currency,
          PARTNER_NO,
        ]
      );
      console.log(`✅ Inserted ${batchNo} - ${itemName}`);
    }

    await client.query("COMMIT");
    console.log("\n🎉 50 approved items seeded for", PARTNER_NO);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
