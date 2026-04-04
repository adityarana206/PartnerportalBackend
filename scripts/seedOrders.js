require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

const vendors  = ["VEN000001", "VEN000002", "VEN000003", "VRG-000001", "VRG-000002", "VNR000001"];
const customers = ["CUST001", "CUST002", "CUST003", "CRN-000001"];

const locations = ["LOC-0001", "LOC-0002", "LOC-0003"];

const items = [
  { itemNo: "BATCH001003", description: "Coffee Product 1",  uom: "KG",  price: 45.00 },
  { itemNo: "BATCH001004", description: "Tea Product 2",     uom: "KG",  price: 30.00 },
  { itemNo: "BATCH001005", description: "Spices Product 3",  uom: "BAG", price: 20.00 },
  { itemNo: "BATCH001006", description: "Dairy Product 4",   uom: "LTR", price: 15.00 },
  { itemNo: "BATCH001007", description: "Grains Product 5",  uom: "KG",  price: 10.00 },
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ─── Clear all existing data ──────────────────────────
    console.log("Deleting existing data...");
    await client.query("DELETE FROM invoice_lines");
    await client.query("DELETE FROM invoices");
    await client.query("DELETE FROM purchase_invoice_lines");
    await client.query("DELETE FROM purchase_invoices");
    await client.query("DELETE FROM sales_order_lines");
    await client.query("DELETE FROM sales_orders");
    await client.query("DELETE FROM purchase_order_lines");
    await client.query("DELETE FROM purchase_orders");
    console.log("Existing data cleared\n");

    // ─── Purchase Orders + Purchase Invoices (vendors) ───
    console.log("Seeding Purchase Orders & Invoices...");
    for (const partnerNo of vendors) {
      for (let i = 1; i <= 20; i++) {
        const orderDate    = addDays(new Date(), -randomBetween(1, 90));
        const deliveryDate = addDays(orderDate, randomBetween(7, 30));
        const dueDate      = addDays(orderDate, randomBetween(15, 45));
        const extDocNo     = `EXT-PO-${partnerNo}-${String(i).padStart(3, "0")}`;

        // ── Purchase Order header ──────────────────────────
        const poRes = await client.query(
          `INSERT INTO purchase_orders (
             order_type, partner_no, partner_type, location_code,
             order_date, requested_delivery_date, currency_code,
             external_document_no, status, direction, submitted_date
           ) VALUES ($1,$2,$3,$4,$5,$6,'AED',$7,'Approved',$8,$9) RETURNING id`,
          [
            "Purchase_x0020_Order",
            partnerNo,
            "Vendor",
            locations[i % locations.length],
            orderDate,
            deliveryDate,
            extDocNo,
            "Portal_x002D_to_x002D_BC",
            orderDate,
          ]
        );
        const poId = poRes.rows[0].id;

        // ── Purchase Order lines ───────────────────────────
        const lineCount = randomBetween(2, 4);
        let poTotal = 0;
        for (let l = 1; l <= lineCount; l++) {
          const item            = items[(i + l) % items.length];
          const qty             = randomBetween(5, 50);
          const unitPrice       = item.price;
          const lineAmount      = parseFloat((qty * unitPrice).toFixed(2));
          const vatPercent      = 5;
          const vatAmount       = parseFloat((lineAmount * vatPercent / 100).toFixed(4));
          const lineAmountInclVat = parseFloat((lineAmount + vatAmount).toFixed(4));
          poTotal += lineAmountInclVat;

          await client.query(
            `INSERT INTO purchase_order_lines (
               order_id, line_no, item_no, description,
               quantity, unit_of_measure_code, unit_price,
               line_discount_percent, line_discount_amount,
               line_amount, location_code, delivery_date,
               vat_code, vat_percent, vat_amount, line_amount_incl_vat
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,0,0,$8,$9,$10,$11,$12,$13,$14)`,
            [
              poId, l * 10000, item.itemNo, item.description,
              qty, item.uom, unitPrice,
              lineAmount, locations[l % locations.length], deliveryDate,
              "VAT5", vatPercent, vatAmount, lineAmountInclVat,
            ]
          );
        }
        poTotal = parseFloat(poTotal.toFixed(2));

        // ── Purchase Invoice ───────────────────────────────
        const piInvoiceNo = `PI-${partnerNo}-${String(i).padStart(3, "0")}`;
        const piRes = await client.query(
          `INSERT INTO purchase_invoices (
             invoice_type, invoice_no, invoice_date, due_date,
             partner_no, partner_type, total_amount, currency_code,
             outstanding_amount, status, bc_invoice_no, linked_order_no
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,'AED',$7,'Approved',$8,$9) RETURNING id`,
          [
            "Purchase_x0020_Invoice",
            piInvoiceNo,
            orderDate,
            dueDate,
            partnerNo,
            "Vendor",
            poTotal,
            `BC-${piInvoiceNo}`,
            extDocNo,
          ]
        );
        const piId = piRes.rows[0].id;

        // ── Purchase Invoice lines (mirror PO lines) ───────
        const poLines = await client.query(
          "SELECT * FROM purchase_order_lines WHERE order_id = $1 ORDER BY line_no",
          [poId]
        );
        for (const [idx, pl] of poLines.rows.entries()) {
          await client.query(
            `INSERT INTO purchase_invoice_lines (
               invoice_id, line_no, item_no, description,
               line_amount, line_discount, line_discount_amount,
               quantity, unit_price, unit_of_measure_code,
               vat, vat_amount, variant_code
             ) VALUES ($1,$2,$3,$4,$5,0,0,$6,$7,$8,$9,$10,NULL)`,
            [
              piId,
              (idx + 1) * 10000,
              pl.item_no,
              pl.description,
              pl.line_amount_incl_vat,
              pl.quantity,
              pl.unit_price,
              pl.unit_of_measure_code,
              pl.vat_percent,
              pl.vat_amount,
            ]
          );
        }

        console.log(`  PO #${poId} + PI #${piId} -> ${partnerNo} (Approved)`);
      }
    }

    // ─── Sales Orders + Sales Invoices (customers) ───────
    console.log("\nSeeding Sales Orders & Invoices...");
    for (const partnerNo of customers) {
      for (let i = 1; i <= 20; i++) {
        const orderDate    = addDays(new Date(), -randomBetween(1, 90));
        const deliveryDate = addDays(orderDate, randomBetween(7, 30));
        const dueDate      = addDays(orderDate, randomBetween(15, 45));
        const extDocNo     = `EXT-SO-${partnerNo}-${String(i).padStart(3, "0")}`;

        // ── Sales Order header ─────────────────────────────
        const soRes = await client.query(
          `INSERT INTO sales_orders (
             order_type, partner_no, partner_type, location_code,
             order_date, requested_delivery_date, currency_code,
             external_document_no, status, direction, submitted_date
           ) VALUES ($1,$2,$3,$4,$5,$6,'AED',$7,'Approved',$8,$9) RETURNING id`,
          [
            "Sales_x0020_Order",
            partnerNo,
            "Customer",
            locations[i % locations.length],
            orderDate,
            deliveryDate,
            extDocNo,
            "Portal_x002D_to_x002D_BC",
            orderDate,
          ]
        );
        const soId = soRes.rows[0].id;

        // ── Sales Order lines ──────────────────────────────
        const lineCount = randomBetween(2, 4);
        let soTotal = 0;
        for (let l = 1; l <= lineCount; l++) {
          const item       = items[(i + l) % items.length];
          const qty        = randomBetween(5, 50);
          const unitPrice  = item.price;
          const lineAmount = parseFloat((qty * unitPrice).toFixed(2));
          soTotal += lineAmount;

          await client.query(
            `INSERT INTO sales_order_lines (
               order_id, line_no, item_no, description,
               quantity, unit_of_measure_code, unit_price,
               line_discount_percent, line_discount_amount,
               line_amount, location_code, delivery_date
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,0,0,$8,$9,$10)`,
            [
              soId, l * 10000, item.itemNo, item.description,
              qty, item.uom, unitPrice,
              lineAmount, locations[l % locations.length], deliveryDate,
            ]
          );
        }
        soTotal = parseFloat(soTotal.toFixed(2));

        // ── Sales Invoice ──────────────────────────────────
        const siInvoiceNo = `SI-${partnerNo}-${String(i).padStart(3, "0")}`;
        const siRes = await client.query(
          `INSERT INTO invoices (
             invoice_type, invoice_no, invoice_date, due_date,
             partner_no, partner_type, total_amount, currency_code,
             outstanding_amount, status, bc_invoice_no, linked_order_no
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,'AED',$7,'Approved',$8,$9) RETURNING id`,
          [
            "Sales_x0020_Invoice",
            siInvoiceNo,
            orderDate,
            dueDate,
            partnerNo,
            "Customer",
            soTotal,
            `BC-${siInvoiceNo}`,
            extDocNo,
          ]
        );
        const siId = siRes.rows[0].id;

        // ── Sales Invoice lines (mirror SO lines) ──────────
        const soLines = await client.query(
          "SELECT * FROM sales_order_lines WHERE order_id = $1 ORDER BY line_no",
          [soId]
        );
        for (const [idx, sl] of soLines.rows.entries()) {
          const vatPercent = 5;
          const vatAmount  = parseFloat((sl.line_amount * vatPercent / 100).toFixed(4));
          await client.query(
            `INSERT INTO invoice_lines (
               invoice_id, line_no, item_no, description,
               line_amount, line_discount, line_discount_amount,
               quantity, unit_price, unit_of_measure_code,
               vat, vat_amount, variant_code
             ) VALUES ($1,$2,$3,$4,$5,0,0,$6,$7,$8,$9,$10,NULL)`,
            [
              siId,
              (idx + 1) * 10000,
              sl.item_no,
              sl.description,
              sl.line_amount,
              sl.quantity,
              sl.unit_price,
              sl.unit_of_measure_code,
              vatPercent,
              vatAmount,
            ]
          );
        }

        console.log(`  SO #${soId} + SI #${siId} -> ${partnerNo} (Approved)`);
      }
    }

    await client.query("COMMIT");

    const poCount = vendors.length  * 20;
    const soCount = customers.length * 20;
    console.log(`\nDone!`);
    console.log(`  Purchase Orders : ${poCount}  |  Purchase Invoices : ${poCount}`);
    console.log(`  Sales Orders    : ${soCount}  |  Sales Invoices    : ${soCount}`);
    console.log(`  Currency        : AED everywhere`);
    console.log(`  Status          : Approved on all documents`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    console.error(err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
