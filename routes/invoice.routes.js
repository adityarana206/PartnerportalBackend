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

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllInvoices);
router.get("/partner/:partnerNo", protect, getInvoicesByPartner);
router.get("/no/:invoiceNo", protect, getInvoiceByNo);
router.get("/:id", protect, getInvoiceById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, createInvoice);
router.post("/businesscentral", protectRegister, createInvoice);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updateInvoice);
router.patch("/:id/status", protect, updateInvoiceStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deleteInvoice);

module.exports = router;
