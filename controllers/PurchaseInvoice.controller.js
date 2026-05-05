const PurchaseInvoice = require("../models/PurchaseInvoice.model");
const MessageStaging = require("../models/MessageStaging.model");

const notify = async (docNo, partnerNo, text) => {
  try {
    await MessageStaging.create({
      threadId: `PI-${docNo}`, documentType: "Message", category: "General",
      linkedDocType: "Purchase Invoice", linkedDocNo: docNo,
      senderType: "Company", senderId: partnerNo,
      messageText: text, direction: "BC-to-Portal", status: "Sent",
    });
  } catch (e) { console.error(`⚠️  Notification failed for Purchase Invoice ${docNo}:`, e.message); }
};

// ─── Create ────────────────────────────────────────────────
const createPurchaseInvoice = async (req, res) => {
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

    const invoice = await PurchaseInvoice.create(req.body, userId);
    await notify(invoice.invoice_no || invoice.id, invoice.partner_no, `Purchase Invoice ${invoice.invoice_no || invoice.id} has been created successfully.`);
    res.status(201).json({
      success: true,
      message: "Purchase invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllPurchaseInvoices = async (req, res) => {
  try {
    const { status, partnerNo } = req.query;
    let invoices;

    if (status) {
      invoices = await PurchaseInvoice.findByStatus(status);
    } else if (partnerNo) {
      invoices = await PurchaseInvoice.findByPartnerNo(partnerNo);
    } else {
      invoices = await PurchaseInvoice.findAll();
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

// ─── Get by ID ─────────────────────────────────────────────
const getPurchaseInvoiceById = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Purchase invoice not found",
      });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by Invoice No ─────────────────────────────────────
const getPurchaseInvoiceByNo = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findByInvoiceNo(req.params.invoiceNo);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Purchase invoice not found",
      });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by Partner No ─────────────────────────────────────
const getPurchaseInvoicesByPartner = async (req, res) => {
  try {
    const invoices = await PurchaseInvoice.findByPartnerNo(
      req.params.partnerNo,
    );
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updatePurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Purchase invoice not found",
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

    const updated = await PurchaseInvoice.update(req.params.id, req.body);
    await notify(invoice.invoice_no || req.params.id, invoice.partner_no, `Purchase Invoice ${invoice.invoice_no || req.params.id} has been updated.`);
    res.status(200).json({
      success: true,
      message: "Purchase invoice updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Status ─────────────────────────────────────────
const updatePurchaseInvoiceStatus = async (req, res) => {
  try {
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

    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Purchase invoice not found",
      });
    }

    const updated = await PurchaseInvoice.updateStatus(req.params.id, status);
    await notify(invoice.invoice_no || req.params.id, invoice.partner_no, `Purchase Invoice ${invoice.invoice_no || req.params.id} status updated to ${status}.`);
    res.status(200).json({
      success: true,
      message: `Purchase invoice status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deletePurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Purchase invoice not found",
      });
    }

    const deleted = await PurchaseInvoice.delete(req.params.id);
    await notify(invoice.invoice_no || req.params.id, invoice.partner_no, `Purchase Invoice ${invoice.invoice_no || req.params.id} has been deleted.`);
    res.status(200).json({
      success: true,
      message: "Purchase invoice deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  getPurchaseInvoiceByNo,
  getPurchaseInvoicesByPartner,
  updatePurchaseInvoice,
  updatePurchaseInvoiceStatus,
  deletePurchaseInvoice,
};
