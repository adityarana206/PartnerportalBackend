const SalesOrder = require("../models/SalesOrder.model");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

// ─── Create ────────────────────────────────────────────────
const createSalesOrder = async (req, res) => {
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
    const order = await SalesOrder.create(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllSalesOrders = async (req, res) => {
  try {
    const status = sanitizeString(req.query.status);
    const partnerNo = sanitizeString(req.query.partnerNo);
    let orders;

    if (status) {
      orders = await SalesOrder.findByStatus(status);
    } else if (partnerNo) {
      orders = await SalesOrder.findByPartnerNo(partnerNo);
    } else {
      orders = await SalesOrder.findAll();
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

// ─── Get by ID ─────────────────────────────────────────────
const getSalesOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by Partner No ─────────────────────────────────────
const getOrdersByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const orders = await SalesOrder.findByPartnerNo(partnerNo);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updateSalesOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
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

    const updated = await SalesOrder.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Sales order updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Status ─────────────────────────────────────────
const updateSalesOrderStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
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

    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    const updated = await SalesOrder.updateStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Sales order status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deleteSalesOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    const deleted = await SalesOrder.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Sales order deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  getOrdersByPartner,
  updateSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
};
