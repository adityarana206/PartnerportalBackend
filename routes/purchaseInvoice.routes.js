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
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("PURCHASE_INVOICES"), getAllPurchaseInvoices);
router.get("/partner/:partnerNo", protect, canRead("PURCHASE_INVOICES"), getPurchaseInvoicesByPartner);
router.get("/no/:invoiceNo", protect, canRead("PURCHASE_INVOICES"), getPurchaseInvoiceByNo);
router.get("/:id", protect, canRead("PURCHASE_INVOICES"), getPurchaseInvoiceById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, canWrite("PURCHASE_INVOICES"), createPurchaseInvoice);
router.post("/businesscentral", protectRegister, createPurchaseInvoice);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("PURCHASE_INVOICES"), updatePurchaseInvoice);
router.patch("/:id/status", protect, canModify("PURCHASE_INVOICES"), updatePurchaseInvoiceStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("PURCHASE_INVOICES"), deletePurchaseInvoice);

module.exports = router;
