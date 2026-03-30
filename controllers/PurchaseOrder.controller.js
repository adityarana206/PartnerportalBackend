const PurchaseOrder = require("../models/PurchaseOrder.model");
const bcService = require("../services/businessCentral.service");

// ─── Create Purchase Order ─────────────────────────────────
const createPurchaseOrder = async (req, res) => {
  try {
    if (!req.body.partnerNo) {
      return res.status(400).json({
        success: false,
        message: "Partner number is required",
      });
    }

    if (
      !req.body.orderStagingLines ||
      req.body.orderStagingLines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one order line is required",
      });
    }
    const userId = req.user ? req.user.id : null;
    const order = await PurchaseOrder.create(req.body, userId);

    // ─── Send to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      const bcData = {
        ...req.body,
        orderType: "Purchase_x0020_Order",
      };
      bcResponse = await bcService.createOrderStaging(bcData);
      console.log("✅ Purchase Order synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: order,
      businessCentral: {
        synced: !!bcResponse,
        response: bcResponse,
        error: bcError,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Purchase Orders ───────────────────────────────
const getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, partnerNo } = req.query;

    let orders;
    if (status) {
      orders = await PurchaseOrder.findByStatus(status);
    } else if (partnerNo) {
      orders = await PurchaseOrder.findByPartnerNo(partnerNo);
    } else {
      orders = await PurchaseOrder.findAll();
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Purchase Order by ID ──────────────────────────────
const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Orders by Partner No ──────────────────────────────
const getOrdersByPartner = async (req, res) => {
  try {
    const orders = await PurchaseOrder.findByPartnerNo(req.params.partnerNo);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Purchase Order ─────────────────────────────────
const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (
      !req.body.orderStagingLines ||
      req.body.orderStagingLines.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one order line is required",
      });
    }

    const updated = await PurchaseOrder.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Purchase order updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Status Only ────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "Processed",
      "Pending",
      "Approved",
      "Rejected",
      "Cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    const updated = await PurchaseOrder.updateStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Purchase Order ─────────────────────────────────
const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    const deleted = await PurchaseOrder.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Purchase order deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getOrdersByPartner,
  updatePurchaseOrder,
  updateOrderStatus,
  deletePurchaseOrder,
};
