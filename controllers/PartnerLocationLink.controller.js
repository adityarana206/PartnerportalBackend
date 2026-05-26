const PartnerLocationLink = require("../models/PartnerLocationLink.model");
const bcService = require("../services/businessCentral.service");

// ─── Create ────────────────────────────────────────────────
const createPartnerLocationLink = async (req, res) => {
  try {
    if (!req.body.locationCode) {
      return res.status(400).json({ success: false, message: "Location code is required" });
    }
    const link = await PartnerLocationLink.create(req.body);
    res.status(201).json({ success: true, message: "Location created successfully", data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllPartnerLocationLinks = async (req, res) => {
  try {
    const { locationCode } = req.query;
    const links = locationCode
      ? await PartnerLocationLink.findByLocationCode(locationCode)
      : await PartnerLocationLink.findAll();
    res.status(200).json({ success: true, count: Array.isArray(links) ? links.length : 1, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by ID ─────────────────────────────────────────────
const getPartnerLocationLinkById = async (req, res) => {
  try {
    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Location not found" });
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updatePartnerLocationLink = async (req, res) => {
  try {
    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Location not found" });
    const updated = await PartnerLocationLink.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Location updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deletePartnerLocationLink = async (req, res) => {
  try {
    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: "Location not found" });
    const deleted = await PartnerLocationLink.delete(req.params.id);
    res.status(200).json({ success: true, message: "Location deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Sync Locations from BC ────────────────────────────────
const syncLocationsFromBC = async (req, res) => {
  try {
    const locations = await bcService.getLocations();
    let inserted = 0, skipped = 0, failed = 0;

    for (const loc of locations) {
      try {
        const { action } = await PartnerLocationLink.upsertFromBC(loc);
        if (action === 'inserted') inserted++;
        else skipped++;
      } catch (_) {
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Sync complete — ${inserted} inserted, ${skipped} skipped`,
      total: locations.length,
      inserted,
      skipped,
      failed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Locations from BC (read-only) ────────────────────
const getLocationsFromBC = async (req, res) => {
  try {
    const raw = await bcService.getLocations();
    const data = raw.map(l => ({
      systemId:          l.systemId,
      code:              l.code,
      name:              l.name,
      address:           l.address,
      address2:          l.address2,
      city:              l.city,
      postCode:          l.postCode,
      countryRegionCode: l.countryRegionCode,
      phoneNo:           l.phoneNo,
      faxNo:             l.faxNo,
      contact:           l.contact,
      eMail:             l.eMail,
      homePage:          l.homePage,
      county:            l.county,
      useAsInTransit:    l.useAsInTransit,
    }));
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPartnerLocationLink,
  getAllPartnerLocationLinks,
  getPartnerLocationLinkById,
  updatePartnerLocationLink,
  deletePartnerLocationLink,
  getLocationsFromBC,
  syncLocationsFromBC,
};
