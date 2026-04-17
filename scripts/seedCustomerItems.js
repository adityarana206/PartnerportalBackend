require("dotenv").config();
const { pool } = require("../config/db");

const PARTNER_NO = "CUST-00045";
const CREATED_BY = 74;

const items = [
  { name: "Arabica Coffee Beans 1kg",     category: "BEANS",    uom: "KG",  price: 18.50, netWt: 1.0,  grossWt: 1.1,  shelf: 365, ingredients: "100% Arabica Coffee Beans",           allergen: "None",          specs: "Grade A, medium roast" },
  { name: "Robusta Coffee Beans 1kg",     category: "BEANS",    uom: "KG",  price: 14.00, netWt: 1.0,  grossWt: 1.1,  shelf: 365, ingredients: "100% Robusta Coffee Beans",           allergen: "None",          specs: "Grade B, dark roast" },
  { name: "Classic Beef Burger Patty",    category: "BURGERS",  uom: "PCS", price: 5.50,  netWt: 0.15, grossWt: 0.18, shelf: 7,   ingredients: "Beef, Salt, Pepper",                 allergen: "None",          specs: "150g patty, frozen" },
  { name: "Chicken Burger Patty",         category: "BURGERS",  uom: "PCS", price: 4.75,  netWt: 0.13, grossWt: 0.16, shelf: 7,   ingredients: "Chicken, Breadcrumbs, Spices",        allergen: "Gluten",        specs: "130g patty, frozen" },
  { name: "Veggie Burger Patty",          category: "BURGERS",  uom: "PCS", price: 4.25,  netWt: 0.12, grossWt: 0.15, shelf: 14,  ingredients: "Soy, Vegetables, Oats",               allergen: "Soy, Gluten",   specs: "120g patty, chilled" },
  { name: "Espresso Blend Coffee 500g",   category: "COFFEE",   uom: "PCS", price: 12.00, netWt: 0.5,  grossWt: 0.55, shelf: 180, ingredients: "Arabica & Robusta Blend",             allergen: "None",          specs: "Fine grind, dark roast" },
  { name: "Filter Coffee Ground 250g",    category: "COFFEE",   uom: "PCS", price: 7.50,  netWt: 0.25, grossWt: 0.28, shelf: 180, ingredients: "100% Arabica",                        allergen: "None",          specs: "Medium grind" },
  { name: "Instant Coffee Sachet 200g",   category: "COFFEE",   uom: "PCS", price: 6.00,  netWt: 0.2,  grossWt: 0.22, shelf: 730, ingredients: "Spray-dried Coffee",                 allergen: "None",          specs: "Freeze-dried granules" },
  { name: "Mixed Tropical Fruits 1kg",    category: "FRUITS",   uom: "KG",  price: 8.00,  netWt: 1.0,  grossWt: 1.05, shelf: 5,   ingredients: "Mango, Pineapple, Papaya",            allergen: "None",          specs: "Fresh, pre-cut" },
  { name: "Strawberry Pack 500g",         category: "FRUITS",   uom: "PCS", price: 5.25,  netWt: 0.5,  grossWt: 0.52, shelf: 4,   ingredients: "Fresh Strawberries",                 allergen: "None",          specs: "Grade A, chilled" },
  { name: "Banana Bunch 1kg",             category: "FRUITS",   uom: "KG",  price: 2.50,  netWt: 1.0,  grossWt: 1.02, shelf: 6,   ingredients: "Fresh Bananas",                      allergen: "None",          specs: "Cavendish variety" },
  { name: "Tomato Soup 400ml",            category: "SOUPS",    uom: "PCS", price: 3.20,  netWt: 0.4,  grossWt: 0.45, shelf: 730, ingredients: "Tomatoes, Water, Salt, Sugar",        allergen: "None",          specs: "Ready to serve, canned" },
  { name: "Chicken Noodle Soup 400ml",    category: "SOUPS",    uom: "PCS", price: 3.80,  netWt: 0.4,  grossWt: 0.45, shelf: 730, ingredients: "Chicken, Noodles, Vegetables, Salt",  allergen: "Gluten",        specs: "Ready to serve, canned" },
  { name: "Mushroom Cream Soup 400ml",    category: "SOUPS",    uom: "PCS", price: 4.00,  netWt: 0.4,  grossWt: 0.45, shelf: 730, ingredients: "Mushrooms, Cream, Salt",              allergen: "Dairy",         specs: "Ready to serve, canned" },
  { name: "Tomato Pasta Sauce 500g",      category: "SOUCES",   uom: "PCS", price: 4.50,  netWt: 0.5,  grossWt: 0.55, shelf: 365, ingredients: "Tomatoes, Olive Oil, Garlic, Basil",  allergen: "None",          specs: "Jar, ambient" },
  { name: "BBQ Sauce 300ml",              category: "SOUCES",   uom: "PCS", price: 3.75,  netWt: 0.3,  grossWt: 0.35, shelf: 365, ingredients: "Tomatoes, Vinegar, Sugar, Spices",    allergen: "None",          specs: "Bottle, ambient" },
  { name: "Chilli Hot Sauce 150ml",       category: "SOUCES",   uom: "PCS", price: 2.90,  netWt: 0.15, grossWt: 0.18, shelf: 365, ingredients: "Chilli, Vinegar, Salt",               allergen: "None",          specs: "Bottle, ambient" },
  { name: "Garlic Powder 100g",           category: "ING",      uom: "PCS", price: 2.20,  netWt: 0.1,  grossWt: 0.12, shelf: 730, ingredients: "Dehydrated Garlic",                  allergen: "None",          specs: "Fine powder" },
  { name: "Onion Powder 100g",            category: "ING",      uom: "PCS", price: 2.00,  netWt: 0.1,  grossWt: 0.12, shelf: 730, ingredients: "Dehydrated Onion",                   allergen: "None",          specs: "Fine powder" },
  { name: "Mixed Herbs 50g",              category: "ING",      uom: "PCS", price: 1.80,  netWt: 0.05, grossWt: 0.07, shelf: 730, ingredients: "Thyme, Oregano, Basil, Rosemary",     allergen: "None",          specs: "Dried, ambient" },
  { name: "Black Pepper Ground 200g",     category: "ING",      uom: "PCS", price: 3.50,  netWt: 0.2,  grossWt: 0.22, shelf: 730, ingredients: "Black Pepper",                       allergen: "None",          specs: "Fine grind" },
  { name: "Sea Salt Fine 500g",           category: "ING",      uom: "PCS", price: 1.50,  netWt: 0.5,  grossWt: 0.52, shelf: 1825,ingredients: "Sea Salt",                           allergen: "None",          specs: "Fine grain, iodized" },
  { name: "Office Chair Ergonomic",       category: "CHAIR",    uom: "PCS", price: 220.00,netWt: 12.0, grossWt: 14.0, shelf: 3650,ingredients: "Steel, Foam, Fabric",                allergen: "None",          specs: "Adjustable height, lumbar support" },
  { name: "Executive Office Desk 160cm",  category: "DESK",     uom: "PCS", price: 450.00,netWt: 35.0, grossWt: 40.0, shelf: 3650,ingredients: "MDF, Steel Frame",                   allergen: "None",          specs: "160x80cm, cable management" },
  { name: "Coffee Table Round 60cm",      category: "TABLE",    uom: "PCS", price: 95.00, netWt: 8.0,  grossWt: 9.5,  shelf: 3650,ingredients: "Tempered Glass, Steel",               allergen: "None",          specs: "60cm diameter, modern design" },
  { name: "Office Furniture Set 4pc",     category: "FURNITURE",uom: "SET", price: 850.00,netWt: 60.0, grossWt: 68.0, shelf: 3650,ingredients: "Wood, Steel, Foam",                  allergen: "None",          specs: "Desk + Chair + Cabinet + Shelf" },
  { name: "Printer Paper A4 500 Sheets",  category: "SUPPLIERS",uom: "PCS", price: 6.50,  netWt: 2.4,  grossWt: 2.5,  shelf: 1825,ingredients: "Wood Pulp",                          allergen: "None",          specs: "80gsm, white" },
  { name: "Ballpoint Pen Box 50pcs",      category: "SUPPLIERS",uom: "BOX", price: 8.00,  netWt: 0.3,  grossWt: 0.35, shelf: 1825,ingredients: "Plastic, Ink",                      allergen: "None",          specs: "Blue ink, medium tip" },
  { name: "Miscellaneous Cleaning Kit",   category: "MISC",     uom: "SET", price: 22.00, netWt: 1.5,  grossWt: 1.8,  shelf: 730, ingredients: "Various Chemicals",                  allergen: "None",          specs: "Multi-surface, 5-piece set" },
  { name: "Maintenance Service Pack",     category: "SERVICES", uom: "PCS", price: 150.00,netWt: 0.0,  grossWt: 0.0,  shelf: 365, ingredients: "N/A",                                allergen: "None",          specs: "Annual maintenance contract" },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let count = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const batchNo  = `BATCH-${String(i + 1).padStart(3, "0")}`;
      const portalNo = `PP-CUST-${String(i + 1).padStart(4, "0")}`;
      const gtin     = `0${String(Math.floor(Math.random() * 9e11 + 1e11))}`;
      const ean      = String(Math.floor(Math.random() * 9e12 + 1e12));

      await client.query(
        `INSERT INTO item_requests (
          batch_no, partner_portal_no, partner_no, item_name, description,
          item_category_code, base_unit_of_measure,
          net_weight, gross_weight, specifications,
          ingredients, allergen_declaration, shelf_life_days,
          gtin, ean_code, unit_price, price_currency_code,
          block, status, created_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
        ) ON CONFLICT DO NOTHING`,
        [
          batchNo, portalNo, PARTNER_NO,
          item.name, item.name + " — premium quality product",
          item.category, item.uom,
          item.netWt, item.grossWt, item.specs,
          item.ingredients, item.allergen, item.shelf,
          gtin, ean, item.price, "AED",
          false, "Approved", CREATED_BY,
        ]
      );
      count++;
    }

    await client.query("COMMIT");
    console.log(`✅ Seeded ${count} items for partner ${PARTNER_NO}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
