const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNo,
  getInvoicesByPartner,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} = require("../controllers/Invoice.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("INVOICES"), getAllInvoices);
router.get("/partner/:partnerNo", protect, canRead("INVOICES"), getInvoicesByPartner);
router.get("/no/:invoiceNo", protect, canRead("INVOICES"), getInvoiceByNo);
router.get("/:id", protect, canRead("INVOICES"), getInvoiceById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, canWrite("INVOICES"), createInvoice);
router.post("/businesscentral", protectRegister, createInvoice);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("INVOICES"), updateInvoice);
router.patch("/:id/status", protect, canModify("INVOICES"), updateInvoiceStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("INVOICES"), deleteInvoice);

module.exports = router;
