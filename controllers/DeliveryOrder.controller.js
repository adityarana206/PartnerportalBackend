const DeliveryOrder = require("../models/DeliveryOrder.model");
const PurchaseOrder = require("../models/PurchaseOrder.model");
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
        deliveryOrderNo:      order.delivery_order_no,
        deliveryDateTime:     req.body.deliveryDateTime      || new Date().toISOString(),
        deliveryType:         req.body.deliveryType          || "ASN",
        partnerNo:            req.body.partnerNo,
        partnerType:          req.body.partnerType           || "Vendor",
        direction:            "Portal-to-BC",
        shipmentDate:         req.body.shipmentDate,
        expectedDeliveryDate: req.body.expectedDeliveryDate  || null,
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
      };

      bcResult = await bcService.createDeliveryStaging(bcPayload);
      console.log(`✅ BC deliveryStaging created: ${order.delivery_order_no}`);
    } catch (err) {
      bcError = err.response?.data || err.message;
      console.error("⚠️  BC deliveryStaging failed:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Delivery order created successfully",
      data: order,
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
  deleteDeliveryOrder,
};
