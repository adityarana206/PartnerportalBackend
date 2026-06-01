const UnitOfMeasure = require("../models/UnitOfMeasure.model");
const { isValidId, sanitizeString } = require("../utils/validation.utils");
const bcService = require("../services/businessCentral.service");

const getAllUOM = async (req, res) => {
  try {
    const units = await UnitOfMeasure.findAll();
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUOMById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const unit = await UnitOfMeasure.findById(req.params.id);
    if (!unit)
      return res.status(404).json({ success: false, message: "Unit of measure not found" });
    res.status(200).json({ success: true, data: unit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUOM = async (req, res) => {
  try {
    if (!req.body.code)
      return res.status(400).json({ success: false, message: "Code is required" });
    const existing = await UnitOfMeasure.findByCode(req.body.code);
    if (existing)
      return res.status(409).json({ success: false, message: `Code '${req.body.code}' already exists` });
    const unit = await UnitOfMeasure.create(req.body);
    res.status(201).json({ success: true, message: "Unit of measure created successfully", data: unit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUOM = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    if (!req.body.code)
      return res.status(400).json({ success: false, message: "Code is required" });
    const existing = await UnitOfMeasure.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ success: false, message: "Unit of measure not found" });
    const updated = await UnitOfMeasure.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Unit of measure updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUOM = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const deleted = await UnitOfMeasure.delete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Unit of measure not found" });
    res.status(200).json({ success: true, message: "Unit of measure deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/unit-of-measures/bc/sync — fetch all UOMs from BC and insert new ones
const syncUOMFromBC = async (req, res) => {
  try {
    const bcUoms = await bcService.getUnitOfMeasures();
    let inserted = 0, skipped = 0, failed = 0;

    for (const item of bcUoms) {
      try {
        const code = (item.code || "").toUpperCase();
        if (!code) { failed++; continue; }

        const existing = await UnitOfMeasure.findByCode(code);
        if (existing) { skipped++; continue; }

        await UnitOfMeasure.create({
          code,
          description:               item.displayName || item.description || null,
          international_standard_code: item.internationalStandardCode || null,
        });
        inserted++;
      } catch (_) {
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `BC sync complete — ${inserted} inserted, ${skipped} skipped${failed ? `, ${failed} failed` : ""}`,
      total: bcUoms.length,
      inserted,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("[syncUOMFromBC]", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUOM, getUOMById, createUOM, updateUOM, deleteUOM, syncUOMFromBC };
