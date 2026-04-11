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
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("PURCHASE_RECEIPTS"), getAllPurchaseReceipts);
router.get("/partner/:partnerNo", protect, canRead("PURCHASE_RECEIPTS"), getPurchaseReceiptsByPartner);
router.get("/shipment/:shipmentNo", protect, canRead("PURCHASE_RECEIPTS"), getPurchaseReceiptByShipmentNo);
router.get("/:id", protect, canRead("PURCHASE_RECEIPTS"), getPurchaseReceiptById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, canWrite("PURCHASE_RECEIPTS"), createPurchaseReceipt);
router.post("/businesscentral", protectRegister, createPurchaseReceipt);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("PURCHASE_RECEIPTS"), updatePurchaseReceipt);
router.patch("/:id/status", protect, canModify("PURCHASE_RECEIPTS"), updatePurchaseReceiptStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("PURCHASE_RECEIPTS"), deletePurchaseReceipt);

module.exports = router;
