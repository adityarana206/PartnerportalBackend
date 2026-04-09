const { pool } = require("../config/db");
const NoSeries = require("../models/NoSeris.model");

async function seedSalesShipments() {
  const client = await pool.connect();
  try {
    console.log("🔄 Seeding sales shipments...");

    // Check if SHIP number series exists
    const shipSeriesCheck = await client.query(
      "SELECT * FROM no_series WHERE code = 'SHIP'"
    );

    if (shipSeriesCheck.rows.length === 0) {
      console.log("📝 Creating SHIP number series...");
      await client.query(`
        INSERT INTO no_series (code, description, starting_no, ending_no, last_no_used, increment_by_no)
        VALUES ('SHIP', 'Shipment Number Series', 60000, 999999, 60000, 1)
      `);
      console.log("✅ SHIP number series created");
    }

    // Sample shipment data
    const shipments = [
      {
        shipmentNo: "102315",
        deliveryType: "Shipment",
        partnerNo: "10000",
        partnerType: "Customer",
        linkedOrderNo: "101041",
        trackingNo: "TRK123456789",
        carrierCode: "DHL",
        shipmentDate: "2026-04-01",
        expectedDeliveryDate: "2026-04-05",
        locationCode: "MAIN",
        shipToCode: "CUST-001",
        status: "In Transit",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "102315",
        lines: [
          {
            lineNo: 10000,
            itemNo: "1000",
            description: "Bicycle",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 1,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 1,
            unitOfMeasureCode: "SET",
            variantCode: "",
          },
          {
            lineNo: 20000,
            itemNo: "1003",
            description: "Butter",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 2,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 2,
            unitOfMeasureCode: "GR",
            variantCode: "",
          },
        ],
      },
      {
        shipmentNo: "102316",
        deliveryType: "Shipment",
        partnerNo: "10000",
        partnerType: "Customer",
        linkedOrderNo: "101042",
        trackingNo: "TRK987654321",
        carrierCode: "FEDEX",
        shipmentDate: "2026-04-02",
        expectedDeliveryDate: "2026-04-06",
        locationCode: "MAIN",
        shipToCode: "CUST-002",
        status: "Delivered",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "102316",
        lines: [
          {
            lineNo: 10000,
            itemNo: "1001",
            description: "Laptop Computer",
            expirationDate: null,
            lotNo: "LOT2024-001",
            orderedQuantity: 5,
            remainingQuantity: 0,
            serialNo: "SN123456",
            shippedQuantity: 5,
            unitOfMeasureCode: "PCS",
            variantCode: "BLACK",
          },
        ],
      },
      {
        shipmentNo: "102317",
        deliveryType: "Shipment",
        partnerNo: "VEND001",
        partnerType: "Vendor",
        linkedOrderNo: "101043",
        trackingNo: "",
        carrierCode: "UPS",
        shipmentDate: "2026-04-03",
        expectedDeliveryDate: "2026-04-08",
        locationCode: "WAREHOUSE",
        shipToCode: "VEND-001",
        status: "Inserted",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "102317",
        lines: [
          {
            lineNo: 10000,
            itemNo: "1004",
            description: "Office Chair",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 10,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 10,
            unitOfMeasureCode: "PCS",
            variantCode: "BLUE",
          },
          {
            lineNo: 20000,
            itemNo: "1005",
            description: "Desk Lamp",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 15,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 15,
            unitOfMeasureCode: "PCS",
            variantCode: "WHITE",
          },
          {
            lineNo: 30000,
            itemNo: "1006",
            description: "Monitor Stand",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 8,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 8,
            unitOfMeasureCode: "PCS",
            variantCode: "",
          },
        ],
      },
      {
        shipmentNo: "102318",
        deliveryType: "Shipment",
        partnerNo: "CUS001",
        partnerType: "Customer",
        linkedOrderNo: "101044",
        trackingNo: "TRK555666777",
        carrierCode: "ARAMEX",
        shipmentDate: "2026-04-04",
        expectedDeliveryDate: "2026-04-07",
        locationCode: "MAIN",
        shipToCode: "CUST-003",
        status: "In Transit",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "102318",
        lines: [
          {
            lineNo: 10000,
            itemNo: "1007",
            description: "Premium Tea Powder",
            expirationDate: "2027-04-04",
            lotNo: "TEA2026-Q2",
            orderedQuantity: 50,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 50,
            unitOfMeasureCode: "KG",
            variantCode: "GREEN",
          },
        ],
      },
      {
        shipmentNo: "102319",
        deliveryType: "Shipment",
        partnerNo: "10000",
        partnerType: "Customer",
        linkedOrderNo: "101045",
        trackingNo: "TRK111222333",
        carrierCode: "DHL",
        shipmentDate: "2026-04-05",
        expectedDeliveryDate: "2026-04-09",
        locationCode: "MAIN",
        shipToCode: "CUST-004",
        status: "Cancelled",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "102319",
        lines: [
          {
            lineNo: 10000,
            itemNo: "1008",
            description: "Wireless Mouse",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 20,
            remainingQuantity: 20,
            serialNo: "",
            shippedQuantity: 0,
            unitOfMeasureCode: "PCS",
            variantCode: "BLACK",
          },
          {
            lineNo: 20000,
            itemNo: "1009",
            description: "Keyboard",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 20,
            remainingQuantity: 20,
            serialNo: "",
            shippedQuantity: 0,
            unitOfMeasureCode: "PCS",
            variantCode: "BLACK",
          },
        ],
      },
    ];

    let insertedCount = 0;

    for (const shipment of shipments) {
      // Generate portal document number
      const portalDocumentNo = await NoSeries.getNextNumberByCode("SHIP");

      // Insert shipment header
      const headerResult = await client.query(
        `INSERT INTO sales_shipments (
          portal_document_no, shipment_no, delivery_type, partner_no, partner_type,
          linked_order_no, tracking_no, carrier_code, shipment_date,
          expected_delivery_date, location_code, ship_to_code, status,
          direction, bc_document_no
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING id`,
        [
          portalDocumentNo,
          shipment.shipmentNo,
          shipment.deliveryType,
          shipment.partnerNo,
          shipment.partnerType,
          shipment.linkedOrderNo,
          shipment.trackingNo,
          shipment.carrierCode,
          shipment.shipmentDate,
          shipment.expectedDeliveryDate,
          shipment.locationCode,
          shipment.shipToCode,
          shipment.status,
          shipment.direction,
          shipment.bcDocumentNo,
        ]
      );

      const shipmentId = headerResult.rows[0].id;

      // Insert shipment lines
      for (const line of shipment.lines) {
        await client.query(
          `INSERT INTO sales_shipment_lines (
            shipment_id, line_no, item_no, description, expiration_date,
            lot_no, ordered_quantity, remaining_quantity, serial_no,
            shipped_quantity, unit_of_measure_code, variant_code
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            shipmentId,
            line.lineNo,
            line.itemNo,
            line.description,
            line.expirationDate,
            line.lotNo,
            line.orderedQuantity,
            line.remainingQuantity,
            line.serialNo,
            line.shippedQuantity,
            line.unitOfMeasureCode,
            line.variantCode,
          ]
        );
      }

      insertedCount++;
      console.log(`✅ Inserted shipment: ${portalDocumentNo} (${shipment.shipmentNo})`);
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Inserted: ${insertedCount} shipments`);
    console.log(`   📦 Total lines: ${shipments.reduce((sum, s) => sum + s.lines.length, 0)}`);
    console.log("\n🎉 Sales shipments seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding shipments:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedSalesShipments()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedSalesShipments;
