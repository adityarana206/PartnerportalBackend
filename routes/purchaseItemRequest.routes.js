const express = require("express");
const router = express.Router();
const {
  createPurchaseItemRequest,
  getAllPurchaseItemRequests,
  getPurchaseItemRequestById,
  getPurchaseItemsByPartner,
  updatePurchaseItemRequest,
  updatePurchaseItemStatus,
  deletePurchaseItemRequest,
} = require("../controllers/PurchaseItemRequest.controller");
const { protect } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllPurchaseItemRequests);
router.get("/partner/:partnerNo", protect, getPurchaseItemsByPartner);
router.get("/:id", protect, getPurchaseItemRequestById);

// ─── WRITE ─────────────────────────────────────────────────
router.post("/", protect, createPurchaseItemRequest);

// ─── MODIFY ────────────────────────────────────────────────
router.put("/:id", protect, updatePurchaseItemRequest);
router.patch("/:batchNo/status", protect, updatePurchaseItemStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deletePurchaseItemRequest);

module.exports = router;
