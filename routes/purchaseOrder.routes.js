const express = require("express");
const router = express.Router();
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getOrdersByPartner,
  updatePurchaseOrder,
  updateOrderStatus,
  deletePurchaseOrder,
  createPurchaseOrderbc,
  getApprovedItemsForPartner,
  getApprovedItemDetail,
  getLocationsForPartner,
  getEligiblePOsForDO,
} = require("../controllers/PurchaseOrder.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllPurchaseOrders);
router.get("/partner/:partnerNo", protect, getOrdersByPartner);
router.get("/items/:partnerNo", protect, getApprovedItemsForPartner);
router.get("/items/:partnerNo/:batchNo", protect, getApprovedItemDetail);
router.get("/eligible-for-do", protect, getEligiblePOsForDO);
router.get("/locations", protect, getLocationsForPartner);
router.get("/:id/businesscentral-confirm", protect, getPurchaseOrderBCConfirm);
router.get("/:id", protect, getPurchaseOrderById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, createPurchaseOrder);
router.post("/businesscentral", protectRegister, createPurchaseOrderbc);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updatePurchaseOrder);
router.patch("/:id/status", protect, updateOrderStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deletePurchaseOrder);

module.exports = router;
