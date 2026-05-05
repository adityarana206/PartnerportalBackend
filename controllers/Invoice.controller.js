const Invoice = require("../models/Invoice.model");
const MessageStaging = require("../models/MessageStaging.model");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

const notify = async (docNo, partnerNo, text) => {
  try {
    await MessageStaging.create({
      threadId: `INV-${docNo}`, documentType: "Message", category: "General",
      linkedDocType: "Invoice", linkedDocNo: docNo,
      senderType: "Company", senderId: partnerNo,
      messageText: text, direction: "BC-to-Portal", status: "Sent",
    });
  } catch (e) { console.error(`⚠️  Notification failed for Invoice ${docNo}:`, e.message); }
};

// ─── Create Invoice ────────────────────────────────────────
const createInvoice = async (req, res) => {
  try {
    if (!req.body.partnerNo) {
      return res.status(400).json({
        success: false,
        message: "Partner number is required",
      });
    }

    if (
      !req.body.portalInvoiceLine ||
      req.body.portalInvoiceLine.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one invoice line is required",
      });
    }
    const userId = req.user ? req.user.id : null;
    const invoice = await Invoice.create(req.body, userId);
    await notify(invoice.invoice_no || invoice.id, invoice.partner_no, `Invoice ${invoice.invoice_no || invoice.id} has been created successfully.`);
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Invoices ──────────────────────────────────────
const getAllInvoices = async (req, res) => {
  try {
    const status = sanitizeString(req.query.status);
    const partnerNo = sanitizeString(req.query.partnerNo);
    let invoices;

    if (status) {
      invoices = await Invoice.findByStatus(status);
    } else if (partnerNo) {
      invoices = await Invoice.findByPartnerNo(partnerNo);
    } else {
      invoices = await Invoice.findAll();
    }

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Invoice by ID ─────────────────────────────────────
const getInvoiceById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Invoice by Invoice No ─────────────────────────────
const getInvoiceByNo = async (req, res) => {
  try {
    const invoiceNo = sanitizeString(req.params.invoiceNo);
    if (!invoiceNo)
      return res.status(400).json({ success: false, message: "Invalid invoice number" });
    const invoice = await Invoice.findByInvoiceNo(invoiceNo);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Invoices by Partner No ────────────────────────────
const getInvoicesByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const invoices = await Invoice.findByPartnerNo(partnerNo);
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Invoice ────────────────────────────────────────
const updateInvoice = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (
      !req.body.portalInvoiceLine ||
      req.body.portalInvoiceLine.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one invoice line is required",
      });
    }

    const updated = await Invoice.update(req.params.id, req.body);
    await notify(invoice.invoice_no || req.params.id, invoice.partner_no, `Invoice ${invoice.invoice_no || req.params.id} has been updated.`);
    res.status(200).json({
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Status ─────────────────────────────────────────
const updateInvoiceStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Paid",
      "Overdue",
      "Cancelled",
      "Partial",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const updated = await Invoice.updateStatus(req.params.id, status);
    await notify(invoice.invoice_no || req.params.id, invoice.partner_no, `Invoice ${invoice.invoice_no || req.params.id} status updated to ${status}.`);
    res.status(200).json({
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Invoice ────────────────────────────────────────
const deleteInvoice = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const deleted = await Invoice.delete(req.params.id);
    await notify(invoice.invoice_no || req.params.id, invoice.partner_no, `Invoice ${invoice.invoice_no || req.params.id} has been deleted.`);
    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoiceByNo,
  getInvoicesByPartner,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
};
