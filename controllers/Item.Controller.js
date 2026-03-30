const ItemRequest = require("../models/Item.model");
const bcService = require("../services/businessCentral.service");

// ─── Create Item Request ───────────────────────────────────
// POST /api/items
const createItemRequest = async (req, res) => {
  try {
    // ─── Validate required fields ──────────────────────────
    if (!req.body.itemName) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // ─── Check duplicate batchNo ───────────────────────────
    if (req.body.batchNo) {
      const existing = await ItemRequest.findByBatchNo(req.body.batchNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Batch number already exists",
        });
      }
    }

    // ─── Create item ───────────────────────────────────────
    const userId = req.user ? req.user.id : null;
    const item = await ItemRequest.create(req.body, userId);

    // ─── Send to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createItemRequest(req.body);
      console.log("✅ Item synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Item request created successfully",
      data: item,
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

// ─── Get All Item Requests ─────────────────────────────────
// GET /api/items
// GET /api/items?status=Created
// GET /api/items?partnerNo=VNR000001
const getAllItemRequests = async (req, res) => {
  try {
    const { status, partnerNo } = req.query;

    let items;
    if (status) {
      items = await ItemRequest.findByStatus(status);
    } else if (partnerNo) {
      items = await ItemRequest.findByPartnerNo(partnerNo);
    } else {
      items = await ItemRequest.findAll();
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Item Request by ID ────────────────────────────────
// GET /api/items/:id
const getItemRequestById = async (req, res) => {
  try {
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Items by Partner No ───────────────────────────────
// GET /api/items/partner/:partnerNo
const getItemsByPartner = async (req, res) => {
  try {
    const items = await ItemRequest.findByPartnerNo(req.params.partnerNo);
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Item Request ───────────────────────────────────
// PUT /api/items/:id
const updateItemRequest = async (req, res) => {
  try {
    // ─── Check item exists ─────────────────────────────────
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    // ─── Only allow update if status is Created ────────────
    if (item.status !== "Created") {
      return res.status(400).json({
        success: false,
        message: `Cannot update item with status: ${item.status}. Only 'Created' items can be updated`,
      });
    }

    // ─── Check duplicate batchNo if changed ────────────────
    if (req.body.batchNo && req.body.batchNo !== item.batch_no) {
      const existing = await ItemRequest.findByBatchNo(req.body.batchNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Batch number already exists",
        });
      }
    }

    const updated = await ItemRequest.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Item request updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Item Status ────────────────────────────────────
// PATCH /api/items/:id/status
const updateItemStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    // ─── Validate status ───────────────────────────────────
    const validStatuses = ["Created", "Pending", "Approved", "Rejected"];
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // ─── Rejection reason required if rejected ─────────────
    if (status === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting an item",
      });
    }

    // ─── Check item exists ─────────────────────────────────
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    const updated = await ItemRequest.updateStatus(
      req.params.id,
      status,
      rejectionReason || null,
    );

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Block / Unblock Item ──────────────────────────────────
// PATCH /api/items/:id/block
const updateItemBlock = async (req, res) => {
  try {
    const { block } = req.body;

    if (typeof block !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Block must be true or false",
      });
    }

    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    const updated = await ItemRequest.updateBlock(req.params.id, block);
    res.status(200).json({
      success: true,
      message: `Item ${block ? "blocked" : "unblocked"} successfully`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Item Request ───────────────────────────────────
// DELETE /api/items/:id
const deleteItemRequest = async (req, res) => {
  try {
    // ─── Check item exists ─────────────────────────────────
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    // ─── Only allow delete if status is Created ────────────
    if (item.status !== "Created") {
      return res.status(400).json({
        success: false,
        message: `Cannot delete item with status: ${item.status}. Only 'Created' items can be deleted`,
      });
    }

    const deleted = await ItemRequest.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Item request deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItemRequest,
  getAllItemRequests,
  getItemRequestById,
  getItemsByPartner,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
};
