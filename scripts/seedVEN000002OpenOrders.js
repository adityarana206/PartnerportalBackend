require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

const orders = [
  {
    extDocNo: "EXT-PO-030", orderDate: "2025-10-01", deliveryDate: "2025-10-18",
    lines: [
      { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00, qty: 20 },
      { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00, qty: 15 },
      { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00, qty: 10 },
    ],
  },
  {
    extDocNo: "EXT-PO-031", orderDate: "2025-10-10", deliveryDate: "2025-10-28",
    lines: [
      { itemNo: "BATCH001006", description: "Dairy Product 4",  uom: "LTR", price: 15.00, qty: 50 },
      { itemNo: "BATCH001007", description: "Grains Product 5", uom: "KG",  price: 10.00, qty: 40 },
    ],
  },
  {
    extDocNo: "EXT-PO-032", orderDate: "2025-10-20", deliveryDate: "2025-11-05",
    lines: [
      { itemNo: "BATCH001008", description: "Sugar Product 6",  uom: "KG",  price: 8.00,  qty: 80 },
      { itemNo: "BATCH001003", description: "Coffee Product 1", uom: "KG",  price: 46.00, qty: 18 },
      { itemNo: "BATCH001006", description: "Dairy Product 4",  uom: "LTR", price: 15.00, qty: 35 },
    ],
  },
  {
    extDocNo: "EXT-PO-033", orderDate: "2025-11-01", deliveryDate: "2025-11-18",
    lines: [
      { itemNo: "BATCH001004", description: "Tea Product 2",    uom: "KG",  price: 31.00, qty: 22 },
      { itemNo: "BATCH001005", description: "Spices Product 3", uom: "BAG", price: 21.00, qty: 14 },
    ],
  },
  {
    extDocNo: "EXT-PO-034", orderDate: "2025-11-15", deliveryDate: "2025-12-02",
    lines: [
      { itemNo: "BATCH001007", description: "Grains Product 5", uom: "KG",  price: 11.00, qty: 60 },
      { itemNo: "BATCH001008", description: "Sugar Product 6",  uom: "KG",  price: 8.50,  qty: 90 },
      { itemNo: "BATCH001003", description: "Coffee Product 1", uom: "KG",  price: 45.00, qty: 25 },
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
         ) VALUES ($1,'VEN000002','Vendor','LOC-0002',$2,$3,'AED',$4,'Open','Portal_x002D_to_x002D_BC',$5) RETURNING id`,
        ["Purchase_x0020_Order", o.orderDate, o.deliveryDate, o.extDocNo, o.orderDate]
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
            lineAmount, "LOC-0002", o.deliveryDate,
            vatPercent, vatAmount, lineAmountInclVat,
          ]
        );
      }

      console.log(`✅ PO ${i + 1} (id=${poId}) | ext: ${o.extDocNo} | ${o.lines.length} lines`);
    }

    await client.query("COMMIT");
    console.log("\n🎉 Seeded 5 Open purchase orders for VEN000002.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
