const SalesOrder = require("../models/SalesOrder.model");
const PartnerLocationLink = require("../models/PartnerLocationLink.model");
const bcService = require("../services/businessCentral.service");
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

    // Save to local DB
    const order = await SalesOrder.create(req.body, userId);

    // Sync to Business Central
    let bcResponse = null;
    let bcError = null;
    try {
      const bcData = { ...req.body, orderType: "Sales_x0020_Order" };
      bcResponse = await bcService.createOrderStaging(bcData);
      console.log("✅ Sales Order synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: order,
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
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

// ─── Items for Partner ─────────────────────────────────────
const getApprovedItemsForPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const items = await SalesOrder.findApprovedItemsByPartner(partnerNo);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Item Detail ───────────────────────────────────────────
const getApprovedItemDetail = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    const batchNo = sanitizeString(req.params.batchNo);
    const item = await SalesOrder.findApprovedItemDetail(partnerNo, batchNo);
    if (!item)
      return res.status(404).json({ success: false, message: "Approved item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Locations ─────────────────────────────────────────────
const getLocationsForPartner = async (_req, res) => {
  try {
    const all = await PartnerLocationLink.findAll();
    const locations = all.filter(l => !l.blocked);
    res.status(200).json({ success: true, count: locations.length, data: locations });
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
  getApprovedItemsForPartner,
  getApprovedItemDetail,
  getLocationsForPartner,
};
