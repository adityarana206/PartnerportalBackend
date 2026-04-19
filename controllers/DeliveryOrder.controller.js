const DeliveryOrder = require("../models/DeliveryOrder.model");
const PurchaseOrder = require("../models/PurchaseOrder.model");

const VALID_STATUSES = ["Draft", "Submitted", "In Transit", "Delivered"];

// ─── Create ────────────────────────────────────────────────
const createDeliveryOrder = async (req, res) => {
  try {
    const { partnerNo, erpPoNos, shipmentDate, expectedDeliveryDate, lines } = req.body;
    if (!partnerNo) {
      return res.status(400).json({ success: false, message: "partnerNo is required" });
    }
    if (!erpPoNos || !Array.isArray(erpPoNos) || erpPoNos.length === 0) {
      return res.status(400).json({ success: false, message: "At least one PO number is required in erpPoNos" });
    }
    if (!shipmentDate) {
      return res.status(400).json({ success: false, message: "shipmentDate is required" });
    }
    if (!expectedDeliveryDate) {
      return res.status(400).json({ success: false, message: "expectedDeliveryDate is required" });
    }
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ success: false, message: "At least one line item is required" });
    }
    for (const line of lines) {
      if (!line.itemNo || !line.toBeShipped || line.toBeShipped <= 0) {
        return res.status(400).json({ success: false, message: "Each line must have itemNo and toBeShipped > 0" });
      }
    }
    
    const order = await DeliveryOrder.create(req.body, req.user?.id);
    
    // Update shipped quantities and check if PO is fully shipped
    const poIds = [...new Set(lines.map(l => l.poId).filter(Boolean))];
    for (const poId of poIds) {
      try {
        const isFullyShipped = await PurchaseOrder.updateShippedQuantities(poId, lines);
        if (isFullyShipped) {
          await PurchaseOrder.updateStatus(poId, "Processed for DO");
          console.log(`✅ PO ${poId} fully shipped - status updated to 'Processed for DO'`);
        } else {
          console.log(`📦 PO ${poId} partially shipped - status remains 'Released'`);
        }
      } catch (err) {
        console.error(`Failed to update PO ${poId}:`, err);
      }
    }
    
    res.status(201).json({ success: true, message: "Delivery order created successfully", data: order });
  } catch (err) {
    console.error("Create delivery order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllDeliveryOrders = async (req, res) => {
  try {
    const { status, partnerNo } = req.query;
    let orders;
    if (status)     orders = await DeliveryOrder.findByStatus(status);
    else if (partnerNo) orders = await DeliveryOrder.findByPartnerNo(partnerNo);
    else            orders = await DeliveryOrder.findAll();
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
    if (!req.body.lines || req.body.lines.length === 0) {
      return res.status(400).json({ success: false, message: "At least one line is required" });
    }
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
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` });
    }
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
