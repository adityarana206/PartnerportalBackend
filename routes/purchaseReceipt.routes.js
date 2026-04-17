const express = require("express");
const router = express.Router();
const {
  createPurchaseReceipt,
  getAllPurchaseReceipts,
  getPurchaseReceiptById,
  getPurchaseReceiptByShipmentNo,
  getPurchaseReceiptsByPartner,
  updatePurchaseReceipt,
  updatePurchaseReceiptStatus,
  deletePurchaseReceipt,
} = require("../controllers/PurchaseReceipt.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllPurchaseReceipts);
router.get("/partner/:partnerNo", protect, getPurchaseReceiptsByPartner);
router.get("/shipment/:shipmentNo", protect, getPurchaseReceiptByShipmentNo);
router.get("/:id", protect, getPurchaseReceiptById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, createPurchaseReceipt);
router.post("/businesscentral", protectRegister, createPurchaseReceipt);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updatePurchaseReceipt);
router.patch("/:id/status", protect, updatePurchaseReceiptStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deletePurchaseReceipt);

module.exports = router;
