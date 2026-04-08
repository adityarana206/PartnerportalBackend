const ItemRequest = require("../models/Item.model");
const NoSeries = require("../models/NoSeris.model");
const UnitOfMeasure = require("../models/UnitOfMeasure.model");
const bcService = require("../services/businessCentral.service");
const { pool } = require("../config/db");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

// ─── Create Item Request ───────────────────────────────────
// POST /api/items
const createItemRequestfrombc = async (req, res) => {
  try {
    if (!req.body.itemName) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    if (!req.body.partnerPortalNo || !req.body.partnerNo || !req.body.batchNo) {
      return res.status(400).json({
        success: false,
        message: "partnerPortalNo, partnerNo, and batchNo are required",
      });
    }

    const userId = req.user ? req.user.id : null;
    const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);

    if (partnerNo) {
      const partnerExists = await ItemRequest.checkPartnerExists(partnerNo);
      if (!partnerExists) {
        return res.status(400).json({
          success: false,
          message: `Partner number '${partnerNo}' does not exist`,
        });
      }
    }

    const item = await ItemRequest.create({ ...req.body, partnerNo }, userId);

    res.status(201).json({
      success: true,
      message: "Item request created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const createItemRequest = async (req, res) => {
  try {
    if (!req.body.itemName)
      return res.status(400).json({ success: false, message: "Item name is required" });

    const batchNo = await NoSeries.getNextNumberByCode("BATCH");
    const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);

    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createItemRequest({ ...req.body, batchNo, partnerNo, status: "Created" });
      console.log("✅ Item synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Item request created successfully",
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/items?status=Created
// GET /api/items?partnerNo=VNR000001
const getAllItemRequests = async (req, res) => {
  try {
    const status = sanitizeString(req.query.status);
    const partnerNo = sanitizeString(req.query.partnerNo);

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
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
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
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const items = await ItemRequest.findByPartnerNo(partnerNo);
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemsByPartnerPortalNo = async (req, res) => {
  try {
    const partnerPortalNo = sanitizeString(req.params.partnerPortalNo);
    if (!partnerPortalNo)
      return res.status(400).json({ success: false, message: "Invalid partner portal number" });
    const items = await ItemRequest.findByPartnerPortalNo(partnerPortalNo);
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemByKey = async (req, res) => {
  try {
    const { partnerPortalNo, partnerNo, batchNo } = req.params;
    const item = await ItemRequest.findByKey(partnerPortalNo, partnerNo, batchNo);
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

// ─── Update Item Request ───────────────────────────────────
// PUT /api/items/:id
const updateItemRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
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
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
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
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
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
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
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

const getUnitOfMeasures = async (req, res) => {
  try {
    const units = await UnitOfMeasure.findAll();
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createItemChangeRequest = async (req, res) => {
  try {
    const {
      itemNo, changeType, changeDescription,
      oldValue, newValue, partnerType, rejectionReason,
    } = req.body;

    if (!itemNo)
      return res.status(400).json({ success: false, message: "itemNo is required" });
    if (!newValue)
      return res.status(400).json({ success: false, message: "newValue is required" });

    const userId = req.user ? req.user.id : null;
    const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);
    const submittedDate = new Date().toISOString();

    // ─── Save to local DB ─────────────────────────────────
    const result = await pool.query(
      `INSERT INTO item_change_requests (
        item_no, change_type, change_description,
        old_value, new_value, partner_no, partner_type,
        status, rejection_reason, submitted_date,
        approved_date, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,'_x0020_',$8,$9,'0001-01-01T00:00:00Z',$10) RETURNING *`,
      [
        itemNo,
        changeType || "",
        changeDescription || "",
        oldValue || "",
        newValue,
        partnerNo,
        partnerType || "_x0020_",
        rejectionReason || "",
        submittedDate,
        userId,
      ]
    );

    // ─── Sync to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createItemChangeRequest({
        itemNo,
        changeType: changeType || "",
        changeDescription: changeDescription || "",
        oldValue: oldValue || "",
        newValue,
        partnerNo,
        partnerType: partnerType || "_x0020_",
        status: "_x0020_",
        rejectionReason: rejectionReason || "",
        submittedDate: "0001-01-01T00:00:00Z",
        approvedDate: "0001-01-01T00:00:00Z",
      });
      console.log("✅ Item change request synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync item change to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Item change request submitted successfully",
      data: result.rows[0],
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPriceChange = async (req, res) => {
  try {
    const {
      itemNo, variantCode, newPrice, oldPrice,
      effectiveDate, endingDate, currencyCode,
      unitOfMeasureCode, minimumQuantity,
      partnerNo, rejectionReason,
    } = req.body;

    if (!itemNo)
      return res.status(400).json({ success: false, message: "itemNo is required" });
    if (newPrice === undefined || newPrice === null)
      return res.status(400).json({ success: false, message: "newPrice is required" });

    const resolvedPartnerNo = partnerNo || (req.user ? req.user.refNo : null);

    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createPriceSubmission({
        itemNo,
        variantCode: variantCode || "",
        newPrice,
        oldPrice: oldPrice || 0,
        effectiveDate,
        endingDate,
        currencyCode: currencyCode || "AED",
        unitOfMeasureCode: unitOfMeasureCode || "",
        minimumQuantity: minimumQuantity || 0,
        partnerNo: resolvedPartnerNo,
        status: "_x0020_",
        rejectionReason: rejectionReason || "",
      });
      console.log("✅ Price submission synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync price to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Price change request submitted successfully",
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
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
  getItemsByPartnerPortalNo,
  getItemByKey,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
  createItemRequestfrombc,
  createItemChangeRequest,
  createPriceChange,
  getUnitOfMeasures,
};
