const SalesOrder = require("../models/SalesOrder.model");
const PartnerLocationLink = require("../models/PartnerLocationLink.model");
const MessageStaging = require("../models/MessageStaging.model");
const bcService = require("../services/businessCentral.service");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

const VALID_STATUSES = ["Draft", "Confirmed", "Shipped", "Paid"];

// ─── Shared validation ─────────────────────────────────────
const validateSalesOrderPayload = (body) => {
  const errors = [];

  // Header mandatory fields
  if (!body.partnerNo)    errors.push("Customer (partnerNo) is required");
  if (!body.orderDate)    errors.push("Order Date is required");
  if (!body.locationCode) errors.push("Location Code is required");

  // Status — optional but must be one of the allowed values when provided
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`);
  }

  // Lines
  if (!Array.isArray(body.orderStagingLines) || body.orderStagingLines.length === 0) {
    errors.push("At least one order line is required");
  } else {
    body.orderStagingLines.forEach((line, idx) => {
      const pos = `Line ${idx + 1}`;
      if (!line.itemNo)               errors.push(`${pos}: Item No is required`);
      if (!line.description)          errors.push(`${pos}: Description is required`);
      if (line.quantity == null || line.quantity === "") errors.push(`${pos}: Qty is required`);
      if (line.unitPrice == null || line.unitPrice === "") errors.push(`${pos}: Unit Price is required`);
      if (line.lineAmountInclVat == null || line.lineAmountInclVat === "") errors.push(`${pos}: Line Amount (inc VAT) is required`);
      if (line.vatAmount == null || line.vatAmount === "") errors.push(`${pos}: VAT Amount is required`);
      // Variant Code mandatory only when a variant is present on the line
      if (line.variantApplicable && !line.variantCode) {
        errors.push(`${pos}: Variant Code is required when variant is applicable`);
      }
    });
  }

  return errors;
};

// ─── Create ────────────────────────────────────────────────
const createSalesOrder = async (req, res) => {
  try {
    const errors = validateSalesOrderPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const userId = req.user ? req.user.id : null;

    // Save to local DB
    const order = await SalesOrder.create(req.body, userId);

    // ─── Create notification message ───────────────────────
    try {
      await MessageStaging.create({
        threadId: `SO-${order.partner_order_no}`,
        documentType: "Message",
        category: "General",
        linkedDocType: "Sales Order",
        linkedDocNo: order.partner_order_no,
        senderType: "Company",
        senderId: order.partner_no,
        senderName: req.body.partnerName || order.partner_no,
        messageText: `Sales Order ${order.partner_order_no} has been created successfully.`,
        direction: "BC-to-Portal",
        status: "Sent",
      });
    } catch (msgErr) {
      console.error(`⚠️  Failed to create notification for SO ${order.partner_order_no}:`, msgErr.message);
    }

    // Sync to Business Central
    let bcResponse = null;
    let bcError = null;
    try {
      const bcData = {
        ...req.body,
        orderType: "Sales_x0020_Order",
        direction: "Portal_x002D_to_x002D_BC",
        submittedDate: new Date().toISOString(),
        externalDocumentNo: req.body.externalDocumentNo || null,
        partnerOrderNo: order.partner_order_no,
      };
      bcResponse = await bcService.createOrderStaging(bcData);
      console.log("✅ Sales Order synced to Business Central:", bcResponse?.id || bcResponse);
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
      return res.status(404).json({ success: false, message: "Sales order not found" });
    }

    const errors = validateSalesOrderPayload(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
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

    const { status, reason } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Sales order not found" });
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

// ─── Patch by partnerOrderNo ──────────────────────────────
const patchSalesOrderByPartnerOrderNo = async (req, res) => {
  try {
    const { partnerOrderNo } = req.params;
    if (!partnerOrderNo)
      return res.status(400).json({ success: false, message: 'partnerOrderNo is required' });

    const updated = await SalesOrder.patchByPartnerOrderNo(partnerOrderNo, req.body);
    if (!updated)
      return res.status(404).json({ success: false, message: 'Sales order not found' });

    res.status(200).json({ success: true, message: 'Sales order updated', data: updated });
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
  patchSalesOrderByPartnerOrderNo,
  getApprovedItemsForPartner,
  getApprovedItemDetail,
  getLocationsForPartner,
};
