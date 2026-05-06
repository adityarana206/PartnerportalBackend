const PurchaseItemRequest = require("../models/PurchaseItemRequest.model");
const MessageStaging = require("../models/MessageStaging.model");
const bcService = require("../services/businessCentral.service");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

// POST /api/purchase-item-requests
const createPurchaseItemRequest = async (req, res) => {
  try {
    if (!req.body.itemName)
      return res.status(400).json({ success: false, message: "itemName is required" });
    if (!req.body.partnerNo)
      return res.status(400).json({ success: false, message: "partnerNo is required" });

    const userId = req.user ? req.user.id : null;
    const item = await PurchaseItemRequest.create(req.body, userId);

    // ─── Notification → sync to BC ─────────────────────────
    try {
      const msg = await MessageStaging.create({
        threadId: `PIR-${item.id}`, documentType: "Message", category: "General",
        linkedDocType: "Purchase Item Request", linkedDocNo: String(item.id),
        senderType: "Company", senderId: item.partner_no,
        messageText: `Purchase Item Request ${item.id} has been created successfully.`,
        direction: "BC-to-Portal", status: "Sent",
      });
      await MessageStaging.syncToBC(msg.id);
    } catch (msgErr) {
      console.error(`⚠️  Notification failed for PIR ${item.id}:`, msgErr.message);
    }

    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createItemRequest(req.body);
      console.log("✅ Purchase item request synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync purchase item request to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Purchase item request created successfully",
      data: item,
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/purchase-item-requests
// GET /api/purchase-item-requests?status=Submitted
// GET /api/purchase-item-requests?partnerNo=VRG-000001
const getAllPurchaseItemRequests = async (req, res) => {
  try {
    const status = sanitizeString(req.query.status);
    const partnerNo = sanitizeString(req.query.partnerNo);

    let items;
    if (status) {
      items = await PurchaseItemRequest.findByStatus(status);
    } else if (partnerNo) {
      items = await PurchaseItemRequest.findByPartnerNo(partnerNo);
    } else {
      items = await PurchaseItemRequest.findAll();
    }

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/purchase-item-requests/:id
const getPurchaseItemRequestById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const item = await PurchaseItemRequest.findById(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Purchase item request not found" });

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/purchase-item-requests/partner/:partnerNo
const getPurchaseItemsByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });

    const items = await PurchaseItemRequest.findByPartnerNo(partnerNo);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/purchase-item-requests/:id
const updatePurchaseItemRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const item = await PurchaseItemRequest.findById(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Purchase item request not found" });

    if (item.status !== "Submitted")
      return res.status(400).json({
        success: false,
        message: `Cannot update item with status: ${item.status}. Only 'Submitted' items can be updated`,
      });

    const updated = await PurchaseItemRequest.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Purchase item request updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/purchase-item-requests/batch/:batchNo/status
const updatePurchaseItemStatus = async (req, res) => {
  try {
    const { batchNo } = req.params;
    if (!batchNo)
      return res.status(400).json({ success: false, message: "batchNo is required" });

    const { status, rejectionReason } = req.body;
    const validStatuses = ["Submitted", "Approved", "Rejected", "Pending"];

    if (!status)
      return res.status(400).json({ success: false, message: "Status is required" });
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    if (status === "Rejected" && !rejectionReason)
      return res.status(400).json({ success: false, message: "Rejection reason is required when rejecting" });

    const item = await PurchaseItemRequest.findByBatchNo(batchNo);
    if (!item)
      return res.status(404).json({ success: false, message: "Purchase item request not found" });

    const updated = await PurchaseItemRequest.updateStatus(item.id, status, rejectionReason || null);
    try {
      const msg = await MessageStaging.create({
        threadId: `PIR-${batchNo}`, documentType: "Message", category: "General",
        linkedDocType: "Purchase Item Request", linkedDocNo: String(batchNo),
        senderType: "Company", senderId: item.partner_no,
        messageText: `Purchase Item Request ${batchNo} status updated to ${status}.`,
        direction: "BC-to-Portal", status: "Sent",
      });
      await MessageStaging.syncToBC(msg.id);
    } catch (e) { console.error(`⚠️  Notification failed for PIR ${batchNo}:`, e.message); }
    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/purchase-item-requests/:id
const deletePurchaseItemRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const item = await PurchaseItemRequest.findById(req.params.id);
    if (!item)
      return res.status(404).json({ success: false, message: "Purchase item request not found" });

    if (item.status !== "Submitted")
      return res.status(400).json({
        success: false,
        message: `Cannot delete item with status: ${item.status}. Only 'Submitted' items can be deleted`,
      });

    const deleted = await PurchaseItemRequest.delete(req.params.id);
    res.status(200).json({ success: true, message: "Purchase item request deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPurchaseItemRequest,
  getAllPurchaseItemRequests,
  getPurchaseItemRequestById,
  getPurchaseItemsByPartner,
  updatePurchaseItemRequest,
  updatePurchaseItemStatus,
  deletePurchaseItemRequest,
};
