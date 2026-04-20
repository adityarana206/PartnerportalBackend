require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

const PARTNER_NO = "VRG-000025";
const LOCATION_CODE = "LOC-0001";

const orders = [
  {
    extDocNo: "EXT-PO-VRG-001", orderDate: "2025-01-08", deliveryDate: "2025-01-25",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 20 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 15 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-002", orderDate: "2025-02-03", deliveryDate: "2025-02-18",
    lines: [
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 30 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.00, qty: 50 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-003", orderDate: "2025-02-20", deliveryDate: "2025-03-08",
    lines: [
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.00, qty: 80 },
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 46.00, qty: 25 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 60 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-004", orderDate: "2025-03-10", deliveryDate: "2025-03-28",
    lines: [
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 31.00, qty: 20 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 18 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-005", orderDate: "2025-04-05", deliveryDate: "2025-04-22",
    lines: [
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.50, qty: 40 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.50, qty: 70 },
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 35 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-006", orderDate: "2025-05-01", deliveryDate: "2025-05-18",
    lines: [
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.50,  qty: 100 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 22  },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-007", orderDate: "2025-06-10", deliveryDate: "2025-06-27",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 47.00, qty: 30 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 21.00, qty: 14 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 16.00, qty: 55 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-008", orderDate: "2025-07-07", deliveryDate: "2025-07-24",
    lines: [
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 11.00, qty: 65 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 90 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-009", orderDate: "2025-08-04", deliveryDate: "2025-08-21",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 40 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.50, qty: 28 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 20 },
    ],
  },
  {
    extDocNo: "EXT-PO-VRG-010", orderDate: "2025-09-02", deliveryDate: "2025-09-20",
    lines: [
      { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.00, qty: 45 },
      { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 11.00, qty: 60 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",   uom: "KG",  price: 8.00,  qty: 75 },
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
         ) VALUES ($1,$2,'Vendor',$3,$4,$5,'AED',$6,'Open','Portal_x002D_to_x002D_BC',$7) RETURNING id`,
        ["Purchase_x0020_Order", PARTNER_NO, LOCATION_CODE, o.orderDate, o.deliveryDate, o.extDocNo, o.orderDate]
      );
      const poId = poRes.rows[0].id;

      for (const [l, line] of o.lines.entries()) {
        const lineAmount        = parseFloat((line.qty * line.price).toFixed(2));
        const vatPercent        = 5;
        const vatAmount         = parseFloat((lineAmount * vatPercent / 100).toFixed(4));
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
            lineAmount, LOCATION_CODE, o.deliveryDate,
            vatPercent, vatAmount, lineAmountInclVat,
          ]
        );
      }

      console.log(`✅ PO ${i + 1} (id=${poId}) -> ${PARTNER_NO} | ${o.lines.length} lines | ext: ${o.extDocNo}`);
    }

    await client.query("COMMIT");
    console.log(`\n🎉 Seeded 10 purchase orders for ${PARTNER_NO} successfully.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
