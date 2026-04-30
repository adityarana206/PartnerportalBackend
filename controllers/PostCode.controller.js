const bcService = require("../services/businessCentral.service");
const PostCode = require("../models/PostCode.model");
const { isValidId } = require("../utils/validation.utils");

// ─── Sync from BC → local DB ───────────────────────────────
const syncPostCodes = async (req, res) => {
  try {
    const data = await bcService.getPostCodes();
    const records = data.value || [];

    let inserted = 0, updated = 0, failed = 0;
    for (const r of records) {
      try {
        const row = await PostCode.upsertFromBC({
          code:        r.code,
          city:        r.city,
          countryCode: r.countryRegionCode || r.countryCode,
          county:      r.county,
          systemId:    r.systemId,
        });
        row.inserted ? inserted++ : updated++;
      } catch (_) {
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync complete — ${inserted} inserted, ${updated} updated, ${failed} failed`,
      count: records.length,
      sync: { inserted, updated, failed },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get all (local DB, with optional search & countryCode filter) ─
const getAllPostCodes = async (req, res) => {
  try {
    const { search, countryCode } = req.query;
    const data = await PostCode.findAll({ search, countryCode });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by ID ─────────────────────────────────────────────
const getPostCodeById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const row = await PostCode.findById(req.params.id);
    if (!row)
      return res.status(404).json({ success: false, message: "Post code not found" });
    res.status(200).json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updatePostCode = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    if (!req.body.code)
      return res.status(400).json({ success: false, message: "code is required" });
    const existing = await PostCode.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Post code not found" });
    const updated = await PostCode.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Post code updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deletePostCode = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const existing = await PostCode.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Post code not found" });
    const deleted = await PostCode.delete(req.params.id);
    res.status(200).json({ success: true, message: "Post code deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { syncPostCodes, getAllPostCodes, getPostCodeById, updatePostCode, deletePostCode };
