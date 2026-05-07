const DeliveryOrder = require("../models/DeliveryOrder.model");
const PurchaseOrder = require("../models/PurchaseOrder.model");
const MessageStaging = require("../models/MessageStaging.model");
const bcService = require("../services/businessCentral.service");

const VALID_STATUSES = ["Created", "Submitted", "In Transit", "Delivered"];

// ─── Create ────────────────────────────────────────────────
const createDeliveryOrder = async (req, res) => {
  try {
    const { partnerNo, shipmentDate } = req.body;
    const lines = req.body.lines || req.body.deliveryStagingsLine || [];

    if (!partnerNo)
      return res.status(400).json({ success: false, message: "partnerNo is required" });
    if (!shipmentDate)
      return res.status(400).json({ success: false, message: "shipmentDate is required" });
    if (!lines || lines.length === 0)
      return res.status(400).json({ success: false, message: "At least one line item is required" });

    // ─── Save to local DB ──────────────────────────────────
    const order = await DeliveryOrder.create({ ...req.body, lines }, req.user?.id);
    console.log("[DO Create] Saved to DB:", order.delivery_order_no);

    // ─── Notification → sync to BC ─────────────────────────
    try {
      const msg = await MessageStaging.create({
        threadId: `DO-${order.delivery_order_no}`,
        documentType: "Message", category: "General",
        linkedDocType: "Delivery Order", linkedDocNo: order.delivery_order_no,
        senderType: "Company", senderId: order.partner_no,
        messageText: `Delivery Order ${order.delivery_order_no} has been created successfully.`,
        direction: "BC-to-Portal", status: "Sent",
      });
      await MessageStaging.syncToBC(msg.id);
    } catch (msgErr) {
      console.error(`⚠️  Notification failed for DO ${order.delivery_order_no}:`, msgErr.message);
    }

    // ─── Update PO shipped quantities ──────────────────────
    const poIds = [...new Set(lines.map(l => l.poId).filter(Boolean))];
    for (const poId of poIds) {
      try {
        const isFullyShipped = await PurchaseOrder.updateShippedQuantities(poId, lines);
        if (isFullyShipped) {
          await PurchaseOrder.updateStatus(poId, "Processed for DO");
          console.log(`✅ PO ${poId} fully shipped - status updated to 'Processed for DO'`);
        }
      } catch (err) {
        console.error(`Failed to update PO ${poId}:`, err.message);
      }
    }

    // ─── Push to Business Central ──────────────────────────
    let bcResult = null;
    let bcError = null;
    try {
      const bcPayload = {
        deliveryOrderNo:      order.delivery_order_no,  // Always use DB-generated number
        deliveryDateTime:     req.body.deliveryDateTime      ? new Date(req.body.deliveryDateTime).toISOString() : new Date().toISOString(),
        deliveryType:         req.body.deliveryType          || "ASN",
        partnerNo:            req.body.partnerNo,
        partnerType:          req.body.partnerType           || "Vendor",
        direction:            "Portal-to-BC",
        shipmentDate:         req.body.shipmentDate          ? req.body.shipmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
        expectedDeliveryDate: req.body.expectedDeliveryDate && req.body.expectedDeliveryDate !== '' ? req.body.expectedDeliveryDate.split('T')[0] : null,
        actualDeliveryDate:   req.body.actualDeliveryDate   && req.body.actualDeliveryDate   !== '' ? req.body.actualDeliveryDate.split('T')[0]   : null,
        deliveryDate:         req.body.actualDeliveryDate   && req.body.actualDeliveryDate   !== '' ? req.body.actualDeliveryDate.split('T')[0]   : null,
        status:               "Inserted",
        locationCode:         req.body.locationCode          || "",
        warehouseLocation:    req.body.warehouseLocation     || "",
        totalAmount:          req.body.totalAmount           || 0,
        currencyCode:         req.body.currencyCode          || "",
        shipAddress:          req.body.shipAddress           || "",
        shipCity:             req.body.shipCity              || "",
        shipState:            req.body.shipState             || "",
        shipPostCode:         req.body.shipPostCode          || "",
        shipCountryCode:      req.body.shipCountryCode       || "",
        deliveryStagingsLine: lines.map((l, i) => ({
          lineNo:            (i + 1) * 10000,
          poNo:              l.poNo              || "",
          poLineNo:          l.poLineNo          || 0,
          poDateTime:        l.poDateTime        || null,
          poTotalAmount:     l.poTotalAmount     || 0,
          itemNo:            l.itemNo            || "",
          description:       l.description       || "",
          orderedQuantity:   parseFloat(l.orderedQuantity || l.orderQty    || 0),
          shippedQuantity:   parseFloat(l.shippedQuantity || l.toBeShipped || 0),
          remainingQuantity: parseFloat(l.remainingQuantity || l.remaining || 0),
          serialNo:          l.serialNo          || "",
          lotNo:             l.lotNo             || "",
          unitOfMeasureCode: l.unitOfMeasureCode || l.unitOfMeasure || "",
          unitPrice:         parseFloat(l.unitPrice || 0),
          variantCode:       l.variantCode       || "",
          expirationDate:    l.expirationDate    || "0001-01-01",
        })),
        documents: (req.body.documents || []).map(d => ({
          name:    d.name    || "",
          url:     d.url     || "",
          size:    d.size    || 0,
          docType: d.docType || "",
        })),
      };

      bcResult = await bcService.createDeliveryStaging(bcPayload);
      console.log(`✅ BC deliveryStaging created: ${order.delivery_order_no}`);
    } catch (err) {
      bcError = err.response?.data || err.message;
      console.error("⚠️  BC deliveryStaging failed:", bcError);
    }

    // ─── Persist BC sync result ────────────────────────────
    await DeliveryOrder.updateBcSync(order.id, !!bcResult, bcError ? JSON.stringify(bcError) : null);

    res.status(201).json({
      success: true,
      message: "Delivery order created successfully",
      data: { ...order, bc_synced: !!bcResult, bc_error: bcError || null },
      businessCentral: { synced: !!bcResult, response: bcResult, error: bcError },
    });
  } catch (err) {
    console.error("[DO Create] ERROR:", err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllDeliveryOrders = async (req, res) => {
  try {
    const { status, partnerNo } = req.query;
    let orders;
    if (status)          orders = await DeliveryOrder.findByStatus(status);
    else if (partnerNo)  orders = await DeliveryOrder.findByPartnerNo(partnerNo);
    else                 orders = await DeliveryOrder.findAll();
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get by ID ─────────────────────────────────────────────
const getDeliveryOrderById = async (req, res) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Delivery order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get by Partner ────────────────────────────────────────
const getDeliveryOrdersByPartner = async (req, res) => {
  try {
    const orders = await DeliveryOrder.findByPartnerNo(req.params.partnerNo);
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updateDeliveryOrder = async (req, res) => {
  try {
    const existing = await DeliveryOrder.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Delivery order not found" });
    if (!req.body.lines || req.body.lines.length === 0)
      return res.status(400).json({ success: false, message: "At least one line is required" });
    const updated = await DeliveryOrder.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Delivery order updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update Status ─────────────────────────────────────────
const updateDeliveryOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status))
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` });
    const existing = await DeliveryOrder.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Delivery order not found" });
    const updated = await DeliveryOrder.updateStatus(req.params.id, status);
    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Reprocess (retry BC push) ─────────────────────────────
const reprocessDeliveryOrder = async (req, res) => {
  try {
    const order = await DeliveryOrder.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Delivery order not found" });

    if (order.bc_synced)
      return res.status(400).json({ success: false, message: "Delivery order is already synced to Business Central" });

    const lines = order.lines || [];
    const bcPayload = {
      deliveryOrderNo:      order.delivery_order_no,
      deliveryDateTime:     order.delivery_date_time  || new Date().toISOString(),
      deliveryType:         order.delivery_type        || "ASN",
      partnerNo:            order.partner_no,
      partnerType:          order.partner_type         || "Vendor",
      direction:            "Portal-to-BC",
      shipmentDate:         order.shipment_date        ? String(order.shipment_date).split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: order.expected_delivery_date ? String(order.expected_delivery_date).split('T')[0] : null,
      status:               "Inserted",
      locationCode:         order.location_code         || "",
      warehouseLocation:    order.warehouse_location    || "",
      totalAmount:          order.total_amount          || 0,
      currencyCode:         order.currency_code         || "",
      shipAddress:          order.ship_address          || "",
      shipCity:             order.ship_city             || "",
      shipState:            order.ship_state            || "",
      shipPostCode:         order.ship_post_code        || "",
      shipCountryCode:      order.ship_country_code     || "",
      deliveryStagingsLine: lines.map((l, i) => ({
        lineNo:            (i + 1) * 10000,
        poNo:              l.po_no              || "",
        poLineNo:          l.po_line_no         || 0,
        poDateTime:        l.po_date_time       || null,
        poTotalAmount:     l.po_total_amount    || 0,
        itemNo:            l.item_no            || "",
        description:       l.description        || "",
        orderedQuantity:   parseFloat(l.ordered_quantity || l.order_qty    || 0),
        shippedQuantity:   parseFloat(l.to_be_shipped    || l.shipped_quantity || 0),
        remainingQuantity: parseFloat(l.remaining        || l.remaining_quantity || 0),
        serialNo:          l.serial_no          || "",
        lotNo:             l.lot_no             || "",
        unitOfMeasureCode: l.unit_of_measure    || "",
        unitPrice:         parseFloat(l.unit_price || 0),
        variantCode:       l.variant_code       || "",
        expirationDate:    l.expiration_date    || "0001-01-01",
      })),
    };

    let bcResult = null;
    let bcError = null;
    try {
      bcResult = await bcService.createDeliveryStaging(bcPayload);
      console.log(`✅ [Reprocess] BC deliveryStaging created: ${order.delivery_order_no}`);
    } catch (err) {
      bcError = err.response?.data || err.message;
      console.error(`⚠️  [Reprocess] BC push failed for ${order.delivery_order_no}:`, bcError);
    }

    const updated = await DeliveryOrder.updateBcSync(
      order.id,
      !!bcResult,
      bcError ? JSON.stringify(bcError) : null
    );

    res.status(200).json({
      success: true,
      message: bcResult
        ? "Delivery order successfully reprocessed to Business Central"
        : "Reprocess attempted but Business Central sync failed",
      data: updated,
      businessCentral: { synced: !!bcResult, response: bcResult, error: bcError },
    });
  } catch (err) {
    console.error("[DO Reprocess] ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deleteDeliveryOrder = async (req, res) => {
  try {
    const existing = await DeliveryOrder.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Delivery order not found" });
    const deleted = await DeliveryOrder.delete(req.params.id);
    res.status(200).json({ success: true, message: "Delivery order deleted successfully", data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createDeliveryOrder,
  getAllDeliveryOrders,
  getDeliveryOrderById,
  getDeliveryOrdersByPartner,
  updateDeliveryOrder,
  updateDeliveryOrderStatus,
  reprocessDeliveryOrder,
  deleteDeliveryOrder,
};
