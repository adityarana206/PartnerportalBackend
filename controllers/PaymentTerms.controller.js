const PaymentTerms = require("../models/PaymentTerms.model");

const createPaymentTerm = async (req, res) => {
  try {
    const { code, description, due_date_calculation } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "code is required" });
    if (!description) return res.status(400).json({ success: false, message: "description is required" });

    const term = await PaymentTerms.create({ ...req.body, due_date_calculation: due_date_calculation ?? '' });
    res.status(201).json({ success: true, data: term });
  } catch (err) {
    const isDuplicate = err.code === "23505";
    res.status(isDuplicate ? 409 : 500).json({
      success: false,
      message: isDuplicate ? "code already exists" : err.message,
    });
  }
};

const getAllPaymentTerms = async (req, res) => {
  try {
    const terms = await PaymentTerms.findAll();
    res.status(200).json({ success: true, count: terms.length, data: terms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPaymentTermById = async (req, res) => {
  try {
    const term = await PaymentTerms.findById(req.params.id);
    if (!term) return res.status(404).json({ success: false, message: "Payment term not found" });
    res.status(200).json({ success: true, data: term });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePaymentTerm = async (req, res) => {
  try {
    const { code, description, due_date_calculation } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "code is required" });
    if (!description) return res.status(400).json({ success: false, message: "description is required" });

    const term = await PaymentTerms.update(req.params.id, { code, description, due_date_calculation: due_date_calculation ?? '' });
    if (!term) return res.status(404).json({ success: false, message: "Payment term not found" });
    res.status(200).json({ success: true, data: term });
  } catch (err) {
    const isDuplicate = err.code === "23505";
    res.status(isDuplicate ? 409 : 500).json({
      success: false,
      message: isDuplicate ? "code already exists" : err.message,
    });
  }
};

const deletePaymentTerm = async (req, res) => {
  try {
    const term = await PaymentTerms.delete(req.params.id);
    if (!term) return res.status(404).json({ success: false, message: "Payment term not found" });
    res.status(200).json({ success: true, message: "Payment term deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const bcService = require("../services/businessCentral.service");

// POST /api/payment-terms/bc/sync
const syncPaymentTermsFromBC = async (req, res) => {
  try {
    const bcTerms = await bcService.getPaymentTerms();
    let inserted = 0, skipped = 0, failed = 0;

    for (const item of bcTerms) {
      try {
        const code = (item.code || "").toUpperCase();
        if (!code) { failed++; continue; }

        const existing = await PaymentTerms.findByCode(code);
        if (existing) { skipped++; continue; }

        await PaymentTerms.create({
          code,
          description:          item.displayName || item.description || code,
          due_date_calculation: item.dueDateCalculation || "",
          dueDays:              item.dueDateCalculation ? 0 : 0,
          discountDays:         item.discountDateCalculation ? 0 : 0,
          discountPct:          item.discountPercent ?? 0,
        });
        inserted++;
      } catch (_) {
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `BC sync complete — ${inserted} inserted, ${skipped} skipped${failed ? `, ${failed} failed` : ""}`,
      total: bcTerms.length,
      inserted,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("[syncPaymentTermsFromBC]", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPaymentTerm, getAllPaymentTerms, getPaymentTermById, updatePaymentTerm, deletePaymentTerm, syncPaymentTermsFromBC };
