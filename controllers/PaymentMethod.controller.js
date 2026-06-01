const PaymentMethod = require("../models/PaymentMethod.model");

const createPaymentMethod = async (req, res) => {
  try {
    const { code, description } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "code is required" });

    const method = await PaymentMethod.create(req.body);
    res.status(201).json({ success: true, data: method });
  } catch (err) {
    const isDuplicate = err.code === "23505";
    res.status(isDuplicate ? 409 : 500).json({
      success: false,
      message: isDuplicate ? "code already exists" : err.message,
    });
  }
};

const getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll();
    res.status(200).json({ success: true, count: methods.length, data: methods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPaymentMethodById = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: "Payment method not found" });
    res.status(200).json({ success: true, data: method });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { code, description } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "code is required" });

    const method = await PaymentMethod.update(req.params.id, { code, description });
    if (!method) return res.status(404).json({ success: false, message: "Payment method not found" });
    res.status(200).json({ success: true, data: method });
  } catch (err) {
    const isDuplicate = err.code === "23505";
    res.status(isDuplicate ? 409 : 500).json({
      success: false,
      message: isDuplicate ? "code already exists" : err.message,
    });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.delete(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: "Payment method not found" });
    res.status(200).json({ success: true, message: "Payment method deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const bcService = require("../services/businessCentral.service");

// POST /api/payment-methods/bc/sync
const syncPaymentMethodsFromBC = async (req, res) => {
  try {
    const bcMethods = await bcService.getPaymentMethods();
    let inserted = 0, skipped = 0, failed = 0;

    for (const item of bcMethods) {
      try {
        const code = (item.code || "").toUpperCase();
        if (!code) { failed++; continue; }

        const existing = await PaymentMethod.findByCode(code);
        if (existing) { skipped++; continue; }

        await PaymentMethod.create({
          code,
          name:        item.displayName || item.description || code,
          description: item.description || item.displayName || null,
        });
        inserted++;
      } catch (_) {
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `BC sync complete — ${inserted} inserted, ${skipped} skipped${failed ? `, ${failed} failed` : ""}`,
      total: bcMethods.length,
      inserted,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("[syncPaymentMethodsFromBC]", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById, updatePaymentMethod, deletePaymentMethod, syncPaymentMethodsFromBC };
