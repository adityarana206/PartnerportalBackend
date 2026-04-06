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
} = require("../controllers/PurchaseOrder.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("PURCHASE_ORDERS"), getAllPurchaseOrders);
router.get("/partner/:partnerNo", protect, canRead("PURCHASE_ORDERS"), getOrdersByPartner);
router.get("/items/:partnerNo", protect, canRead("PURCHASE_ORDERS"), getApprovedItemsForPartner);
router.get("/items/:partnerNo/:batchNo", protect, canRead("PURCHASE_ORDERS"), getApprovedItemDetail);
router.get("/locations", protect, canRead("PURCHASE_ORDERS"), getLocationsForPartner);
router.get("/:id", protect, canRead("PURCHASE_ORDERS"), getPurchaseOrderById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, canWrite("PURCHASE_ORDERS"), createPurchaseOrder);
router.post("/businesscentral", protectRegister, createPurchaseOrderbc);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("PURCHASE_ORDERS"), updatePurchaseOrder);
router.patch("/:id/status", protect, canModify("PURCHASE_ORDERS"), updateOrderStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("PURCHASE_ORDERS"), deletePurchaseOrder);

module.exports = router;
