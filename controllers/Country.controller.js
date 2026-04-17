const Country = require("../models/Country.model");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

// ─── Create ────────────────────────────────────────────────
const createCountry = async (req, res) => {
  try {
    const { code, name, currencyCode } = req.body;
    if (!code || !name || !currencyCode) {
      return res.status(400).json({
        success: false,
        message: "code, name, and currencyCode are required",
      });
    }
    const country = await Country.create(req.body);
    res.status(201).json({ success: true, message: "Country created successfully", data: country });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: `Country code '${req.body.code}' already exists` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllCountries = async (_req, res) => {
  try {
    const data = await Country.findAll();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Active Country (system currency source) ───────────
const getActiveCountry = async (_req, res) => {
  try {
    const country = await Country.findActive();
    if (!country) {
      return res.status(404).json({ success: false, message: "No active country set" });
    }
    res.status(200).json({ success: true, data: country });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by ID ─────────────────────────────────────────────
const getCountryById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const country = await Country.findById(req.params.id);
    if (!country)
      return res.status(404).json({ success: false, message: "Country not found" });
    res.status(200).json({ success: true, data: country });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updateCountry = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const existing = await Country.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Country not found" });

    const { code, name, currencyCode } = req.body;
    if (!code || !name || !currencyCode) {
      return res.status(400).json({
        success: false,
        message: "code, name, and currencyCode are required",
      });
    }

    const updated = await Country.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Country updated successfully", data: updated });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: `Country code '${req.body.code}' already exists` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Activate (sets system currency) ──────────────────────
const activateCountry = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const existing = await Country.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Country not found" });

    const activated = await Country.activate(req.params.id);
    res.status(200).json({
      success: true,
      message: `'${activated.name}' is now the active country. System currency set to ${activated.currency_code}`,
      data: activated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deleteCountry = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const existing = await Country.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Country not found" });
    if (existing.is_active)
      return res.status(400).json({ success: false, message: "Cannot delete the active country. Activate another country first." });

    const deleted = await Country.delete(req.params.id);
    res.status(200).json({ success: true, message: "Country deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCountry,
  getAllCountries,
  getActiveCountry,
  getCountryById,
  updateCountry,
  activateCountry,
  deleteCountry,
};
