const express = require("express");
const router = express.Router();
const {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  getPurchaseInvoiceByNo,
  getPurchaseInvoicesByPartner,
  updatePurchaseInvoice,
  updatePurchaseInvoiceStatus,
  deletePurchaseInvoice,
} = require("../controllers/PurchaseInvoice.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllPurchaseInvoices);
router.get("/partner/:partnerNo", protect, getPurchaseInvoicesByPartner);
router.get("/no/:invoiceNo", protect, getPurchaseInvoiceByNo);
router.get("/:id", protect, getPurchaseInvoiceById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, createPurchaseInvoice);
router.post("/businesscentral", protectRegister, createPurchaseInvoice);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updatePurchaseInvoice);
router.patch("/:id/status", protect, updatePurchaseInvoiceStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deletePurchaseInvoice);

module.exports = router;
