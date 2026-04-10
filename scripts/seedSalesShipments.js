const { pool } = require("../config/db");
const NoSeries = require("../models/NoSeris.model");

async function seedSalesShipments() {
  const client = await pool.connect();
  try {
    console.log("🔄 Seeding sales shipments...");

    await client.query("DELETE FROM sales_shipment_lines");
    await client.query("DELETE FROM sales_shipments");
    console.log("✅ Deleted existing shipment data");

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

    const shipments = [
      {
        shipmentNo: "SHP001",
        deliveryType: "Shipment",
        partnerNo: "CUST001",
        partnerType: "Customer",
        linkedOrderNo: "SO001",
        trackingNo: "TRK001234567",
        carrierCode: "DHL",
        shipmentDate: "2026-04-01",
        expectedDeliveryDate: "2026-04-05",
        locationCode: "LOC-0001",
        shipToCode: "CUST001",
        status: "In Transit",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "SHP001",
        lines: [
          {
            lineNo: 10000,
            itemNo: "PORTAL000002",
            description: "Product A",
            expirationDate: null,
            lotNo: "",
            orderedQuantity: 15,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 15,
            unitOfMeasureCode: "PCS",
            variantCode: "",
          },
          {
            lineNo: 20000,
            itemNo: "PORTAL000003",
            description: "COFFEE Product 1",
            expirationDate: null,
            lotNo: "COFFEE-LOT-001",
            orderedQuantity: 10,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 10,
            unitOfMeasureCode: "KG",
            variantCode: "",
          },
        ],
      },
      {
        shipmentNo: "SHP002",
        deliveryType: "Shipment",
        partnerNo: "CUST001",
        partnerType: "Customer",
        linkedOrderNo: "SO002",
        trackingNo: "TRK001234568",
        carrierCode: "FEDEX",
        shipmentDate: "2026-04-03",
        expectedDeliveryDate: "2026-04-07",
        locationCode: "LOC-0002",
        shipToCode: "CUST001",
        status: "Delivered",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "SHP002",
        lines: [
          {
            lineNo: 10000,
            itemNo: "PORTAL000004",
            description: "TEA Product 2",
            expirationDate: "2027-04-03",
            lotNo: "TEA-LOT-002",
            orderedQuantity: 25,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 25,
            unitOfMeasureCode: "KG",
            variantCode: "",
          },
        ],
      },
      {
        shipmentNo: "SHP003",
        deliveryType: "Shipment",
        partnerNo: "CUST002",
        partnerType: "Customer",
        linkedOrderNo: "SO003",
        trackingNo: "TRK002345678",
        carrierCode: "UPS",
        shipmentDate: "2026-04-05",
        expectedDeliveryDate: "2026-04-09",
        locationCode: "LOC-0003",
        shipToCode: "CUST002",
        status: "In Transit",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "SHP003",
        lines: [
          {
            lineNo: 10000,
            itemNo: "PORTAL000005",
            description: "SPICES Product 3",
            expirationDate: null,
            lotNo: "SPICES-LOT-001",
            orderedQuantity: 20,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 20,
            unitOfMeasureCode: "KG",
            variantCode: "",
          },
          {
            lineNo: 20000,
            itemNo: "PORTAL000006",
            description: "DAIRY Product 4",
            expirationDate: "2026-05-05",
            lotNo: "DAIRY-LOT-001",
            orderedQuantity: 35,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 35,
            unitOfMeasureCode: "LTR",
            variantCode: "",
          },
        ],
      },
      {
        shipmentNo: "SHP004",
        deliveryType: "Shipment",
        partnerNo: "CUST002",
        partnerType: "Customer",
        linkedOrderNo: "SO004",
        trackingNo: "TRK002345679",
        carrierCode: "ARAMEX",
        shipmentDate: "2026-04-06",
        expectedDeliveryDate: "2026-04-10",
        locationCode: "LOC-0004",
        shipToCode: "CUST002",
        status: "Inserted",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "SHP004",
        lines: [
          {
            lineNo: 10000,
            itemNo: "PORTAL000008",
            description: "COFFEE Product 6",
            expirationDate: null,
            lotNo: "COFFEE-LOT-002",
            orderedQuantity: 18,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 18,
            unitOfMeasureCode: "KG",
            variantCode: "",
          },
        ],
      },
      {
        shipmentNo: "SHP005",
        deliveryType: "Shipment",
        partnerNo: "CUST003",
        partnerType: "Customer",
        linkedOrderNo: "SO005",
        trackingNo: "TRK003456789",
        carrierCode: "DHL",
        shipmentDate: "2026-04-08",
        expectedDeliveryDate: "2026-04-12",
        locationCode: "LOC-0005",
        shipToCode: "CUST003",
        status: "In Transit",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "SHP005",
        lines: [
          {
            lineNo: 10000,
            itemNo: "PORTAL000009",
            description: "TEA Product 7",
            expirationDate: "2027-04-08",
            lotNo: "TEA-LOT-003",
            orderedQuantity: 50,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 50,
            unitOfMeasureCode: "KG",
            variantCode: "",
          },
          {
            lineNo: 20000,
            itemNo: "PORTAL000010",
            description: "SPICES Product 8",
            expirationDate: null,
            lotNo: "SPICES-LOT-002",
            orderedQuantity: 30,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 30,
            unitOfMeasureCode: "KG",
            variantCode: "",
          },
        ],
      },
      {
        shipmentNo: "SHP006",
        deliveryType: "Shipment",
        partnerNo: "CUST003",
        partnerType: "Customer",
        linkedOrderNo: "SO006",
        trackingNo: "TRK003456790",
        carrierCode: "FEDEX",
        shipmentDate: "2026-04-10",
        expectedDeliveryDate: "2026-04-14",
        locationCode: "LOC-0006",
        shipToCode: "CUST003",
        status: "Delivered",
        direction: "BC_x002D_to_x002D_Portal",
        bcDocumentNo: "SHP006",
        lines: [
          {
            lineNo: 10000,
            itemNo: "PORTAL000011",
            description: "DAIRY Product 9",
            expirationDate: "2026-05-10",
            lotNo: "DAIRY-LOT-002",
            orderedQuantity: 45,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 45,
            unitOfMeasureCode: "LTR",
            variantCode: "",
          },
          {
            lineNo: 20000,
            itemNo: "PORTAL000013",
            description: "GRAINS Product 10",
            expirationDate: null,
            lotNo: "GRAINS-LOT-001",
            orderedQuantity: 100,
            remainingQuantity: 0,
            serialNo: "",
            shippedQuantity: 100,
            unitOfMeasureCode: "KG",
            variantCode: "",
          },
        ],
      },
    ];

    let insertedCount = 0;

    for (const shipment of shipments) {
      const portalDocumentNo = await NoSeries.getNextNumberByCode("SHIP");

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
      console.log(`✅ Inserted shipment: ${portalDocumentNo} (${shipment.shipmentNo}) for ${shipment.partnerNo} at ${shipment.locationCode}`);
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Inserted: ${insertedCount} shipments`);
    console.log(`   📦 Total lines: ${shipments.reduce((sum, s) => sum + s.lines.length, 0)}`);
    console.log(`   👥 Customers: CUST001 (2), CUST002 (2), CUST003 (2)`);
    console.log(`   📍 Locations: LOC-0001 to LOC-0006`);
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
