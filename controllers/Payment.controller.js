const Payment = require("../models/Payment.model");
const MessageStaging = require("../models/MessageStaging.model");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

const notify = async (docNo, partnerNo, text) => {
  try {
    await MessageStaging.create({
      threadId: `PAY-${docNo}`, documentType: "Message", category: "General",
      linkedDocType: "Payment", linkedDocNo: docNo,
      senderType: "Company", senderId: partnerNo,
      messageText: text, direction: "BC-to-Portal", status: "Sent",
    });
  } catch (e) { console.error(`⚠️  Notification failed for Payment ${docNo}:`, e.message); }
};

const VALID_STATUSES = ["Pending", "Completed", "Failed", "Cancelled"];

const getAllPayments = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.query.partnerNo);
    const status = sanitizeString(req.query.status);

    let payments;
    if (status) payments = await Payment.findByStatus(status);
    else if (partnerNo) payments = await Payment.findByPartnerNo(partnerNo);
    else payments = await Payment.findAll();

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const payment = await Payment.findById(req.params.id);
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentsByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const payments = await Payment.findByPartnerNo(partnerNo);
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    if (!req.body.paymentNumber && !req.body.referenceNo)
      return res.status(400).json({ success: false, message: "paymentNumber or referenceNo is required" });
    if (req.body.amount === undefined || req.body.amount === null)
      return res.status(400).json({ success: false, message: "Amount is required" });

    const userId = req.user ? req.user.id : null;
    const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);
    const data = {
      ...req.body,
      partnerNo,
      paymentNumber:   req.body.paymentNumber  || req.body.referenceNo,
      invoiceNo:       req.body.invoiceNo       || null,
      orderNo:         req.body.OrderNo         || req.body.orderNo        || null,
      dueDate:         req.body.DueDate         || req.body.dueDate        || null,
      method:          req.body.method          || req.body.paymentMethod  || null,
      amountLCY:       req.body.amountLCY       || null,
      remainingAmount: req.body.remainingAmount || null,
      postingDate:     req.body.postingDate     || null,
      documentDate:    req.body.documentDate    || null,
      documentType:    req.body.documentType    || null,
      documentNo:      req.body.documentNo      || null,
      closedByEntryNo: req.body.closedByEntryNo || null,
      closedAtDate:    req.body.closedAtDate    || null,
      balAccountNo:    req.body.balAccountNo    || null,
    };
    const payment = await Payment.create(data, userId);
    await notify(payment.payment_number || payment.id, payment.partner_no, `Payment ${payment.payment_number || payment.id} has been created successfully.`);
    res.status(201).json({ success: true, message: "Payment created successfully", data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const existing = await Payment.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const updated = await Payment.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Payment updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status))
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` });

    const existing = await Payment.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Payment not found" });

    const updated = await Payment.updateStatus(req.params.id, status);
    await notify(existing.payment_number || req.params.id, existing.partner_no, `Payment ${existing.payment_number || req.params.id} status updated to ${status}.`);
    res.status(200).json({ success: true, message: `Payment status updated to ${status}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const deleted = await Payment.delete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, message: "Payment deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByPartner,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
};
