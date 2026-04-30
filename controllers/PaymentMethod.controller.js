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

module.exports = { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById };
