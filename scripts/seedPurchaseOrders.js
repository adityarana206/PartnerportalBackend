require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

const orders = [
  // ── VEN000001 (10 orders) ─────────────────────────────────────────────────
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-001", orderDate: "2025-01-10", deliveryDate: "2025-01-25",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 20 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 15 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 10 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-011", orderDate: "2025-02-05", deliveryDate: "2025-02-20",
    lines: [
      { itemNo: "BATCH001006", description: "Dairy Product 4",  uom: "LTR", price: 15.00, qty: 30 },
      { itemNo: "BATCH001007", description: "Grains Product 5", uom: "KG",  price: 10.00, qty: 50 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-012", orderDate: "2025-03-01", deliveryDate: "2025-03-15",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 46.00, qty: 25 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 21.00, qty: 18 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 60 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-013", orderDate: "2025-03-20", deliveryDate: "2025-04-05",
    lines: [
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 31.00, qty: 20 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.50, qty: 80 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-014", orderDate: "2025-04-10", deliveryDate: "2025-04-25",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 35 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.50, qty: 40 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 90 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-015", orderDate: "2025-05-05", deliveryDate: "2025-05-20",
    lines: [
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 15 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 11.00, qty: 70 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-016", orderDate: "2025-06-01", deliveryDate: "2025-06-18",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 47.00, qty: 30 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 25 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 16.00, qty: 55 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-017", orderDate: "2025-07-10", deliveryDate: "2025-07-28",
    lines: [
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.50,  qty: 100 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 20  },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-018", orderDate: "2025-08-05", deliveryDate: "2025-08-22",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 40 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.00, qty: 65 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.50, qty: 30 },
    ],
  },
  {
    partnerNo: "VEN000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-019", orderDate: "2025-09-01", deliveryDate: "2025-09-20",
    lines: [
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.00, qty: 45 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 75 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 21.00, qty: 12 },
    ],
  },

  // ── VEN000002 (10 orders) ─────────────────────────────────────────────────
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-002", orderDate: "2025-01-15", deliveryDate: "2025-02-01",
    lines: [
      { itemNo: "BATCH001006", description: "Dairy Product 4",  uom: "LTR", price: 15.00, qty: 50 },
      { itemNo: "BATCH001007", description: "Grains Product 5", uom: "KG",  price: 10.00, qty: 40 },
      { itemNo: "BATCH001003", description: "Coffee Product 1", uom: "KG",  price: 45.00, qty: 12 },
      { itemNo: "BATCH001004", description: "Tea Product 2",    uom: "KG",  price: 30.00, qty: 8  },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-021", orderDate: "2025-02-12", deliveryDate: "2025-03-01",
    lines: [
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 35 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 80 },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-022", orderDate: "2025-03-05", deliveryDate: "2025-03-22",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 46.00, qty: 18 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.00, qty: 60 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.00, qty: 45 },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-023", orderDate: "2025-04-01", deliveryDate: "2025-04-18",
    lines: [
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 31.00, qty: 22 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.50,  qty: 95 },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-024", orderDate: "2025-04-25", deliveryDate: "2025-05-12",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 28 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 16 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 11.00, qty: 55 },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-025", orderDate: "2025-05-20", deliveryDate: "2025-06-05",
    lines: [
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 16.00, qty: 70 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 18 },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-026", orderDate: "2025-06-15", deliveryDate: "2025-07-02",
    lines: [
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 110 },
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 47.00, qty: 22  },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 21.00, qty: 14  },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-027", orderDate: "2025-07-20", deliveryDate: "2025-08-06",
    lines: [
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.50, qty: 85 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.50, qty: 48 },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-028", orderDate: "2025-08-10", deliveryDate: "2025-08-28",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 32 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 27 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 88 },
    ],
  },
  {
    partnerNo: "VEN000002", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-029", orderDate: "2025-09-05", deliveryDate: "2025-09-22",
    lines: [
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.50, qty: 25 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 11.00, qty: 60 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.00, qty: 38 },
    ],
  },

  // ── Other vendors (unchanged) ─────────────────────────────────────────────
  {
    partnerNo: "VEN000003", locationCode: "LOC-0003",
    extDocNo: "EXT-PO-003", orderDate: "2025-01-20", deliveryDate: "2025-02-05",
    lines: [
      { itemNo: "BATCH001005", description: "Spices Product 3", uom: "BAG", price: 20.00, qty: 30 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",  uom: "LTR", price: 15.00, qty: 25 },
    ],
  },
  {
    partnerNo: "VRG-000001", locationCode: "LOC-0001",
    extDocNo: "EXT-PO-004", orderDate: "2025-02-01", deliveryDate: "2025-02-15",
    lines: [
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.00, qty: 100 },
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 18  },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 22  },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 15  },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.00, qty: 35  },
    ],
  },
  {
    partnerNo: "VNR000001", locationCode: "LOC-0002",
    extDocNo: "EXT-PO-005", orderDate: "2025-02-10", deliveryDate: "2025-02-28",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1", uom: "KG",  price: 45.00, qty: 25 },
      { itemNo: "BATCH001007", description: "Grains Product 5", uom: "KG",  price: 10.00, qty: 60 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",  uom: "LTR", price: 15.00, qty: 45 },
    ],
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const [i, o] of orders.entries()) {
      const poRes = await client.query(
        `INSERT INTO purchase_orders (
           order_type, partner_no, partner_type, location_code,
           order_date, requested_delivery_date, currency_code,
           external_document_no, status, direction, submitted_date
         ) VALUES ($1,$2,'Vendor',$3,$4,$5,'AED',$6,'Approved','Portal_x002D_to_x002D_BC',$7) RETURNING id`,
        ["Purchase_x0020_Order", o.partnerNo, o.locationCode, o.orderDate, o.deliveryDate, o.extDocNo, o.orderDate]
      );
      const poId = poRes.rows[0].id;

      for (const [l, line] of o.lines.entries()) {
        const lineAmount       = parseFloat((line.qty * line.price).toFixed(2));
        const vatPercent       = 5;
        const vatAmount        = parseFloat((lineAmount * vatPercent / 100).toFixed(4));
        const lineAmountInclVat = parseFloat((lineAmount + vatAmount).toFixed(4));

        await client.query(
          `INSERT INTO purchase_order_lines (
             order_id, line_no, item_no, description,
             quantity, unit_of_measure_code, unit_price,
             line_discount_percent, line_discount_amount,
             line_amount, location_code, delivery_date,
             vat_code, vat_percent, vat_amount, line_amount_incl_vat
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,0,0,$8,$9,$10,'VAT5',$11,$12,$13)`,
          [
            poId, (l + 1) * 10000, line.itemNo, line.description,
            line.qty, line.uom, line.price,
            lineAmount, o.locationCode, o.deliveryDate,
            vatPercent, vatAmount, lineAmountInclVat,
          ]
        );
      }

      console.log(`✅ PO ${i + 1} (id=${poId}) -> ${o.partnerNo} | ${o.lines.length} lines | ext: ${o.extDocNo}`);
    }

    await client.query("COMMIT");
    console.log("\n🎉 Seeded 23 purchase orders successfully (10x VEN000001, 10x VEN000002, 3x others).");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
