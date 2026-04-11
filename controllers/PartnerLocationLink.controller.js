const PartnerLocationLink = require("../models/PartnerLocationLink.model");

// ─── Create ────────────────────────────────────────────────
const createPartnerLocationLink = async (req, res) => {
  try {
    if (!req.body.partnerNo) {
      return res.status(400).json({
        success: false,
        message: "Partner number is required",
      });
    }

    if (!req.body.partnerType) {
      return res.status(400).json({
        success: false,
        message: "Partner type is required",
      });
    }
    const userId = req.user ? req.user.id : null;

    const link = await PartnerLocationLink.create(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Partner location link created successfully",
      data: link,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All ───────────────────────────────────────────────
const getAllPartnerLocationLinks = async (req, res) => {
  try {
    const { partnerNo, partnerType, locationCode } = req.query;

    let links;
    if (partnerNo) {
      links = await PartnerLocationLink.findByPartnerNo(partnerNo);
    } else if (partnerType) {
      links = await PartnerLocationLink.findByPartnerType(partnerType);
    } else if (locationCode) {
      links = await PartnerLocationLink.findByLocationCode(locationCode);
    } else {
      links = await PartnerLocationLink.findAll();
    }

    res.status(200).json({
      success: true,
      count: links.length,
      data: links,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by ID ─────────────────────────────────────────────
const getPartnerLocationLinkById = async (req, res) => {
  try {
    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Partner location link not found",
      });
    }
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get by Partner No ─────────────────────────────────────
const getLinksByPartner = async (req, res) => {
  try {
    const links = await PartnerLocationLink.findByPartnerNo(
      req.params.partnerNo,
    );
    res.status(200).json({
      success: true,
      count: links.length,
      data: links,
    });
  } catch (error) {
    console.error('Error fetching partner locations:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch partner locations'
    });
  }
};

// ─── Get Default by Partner No ─────────────────────────────
const getDefaultLinkByPartner = async (req, res) => {
  try {
    const link = await PartnerLocationLink.findDefaultByPartnerNo(
      req.params.partnerNo,
    );
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "No default location found for this partner",
      });
    }
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update ────────────────────────────────────────────────
const updatePartnerLocationLink = async (req, res) => {
  try {
    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Partner location link not found",
      });
    }

    const updated = await PartnerLocationLink.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Partner location link updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Block / Unblock ───────────────────────────────────────
const updateBlockStatus = async (req, res) => {
  try {
    const { blocked } = req.body;

    if (typeof blocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Blocked must be true or false",
      });
    }

    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Partner location link not found",
      });
    }

    const updated = await PartnerLocationLink.updateBlocked(
      req.params.id,
      blocked,
    );
    res.status(200).json({
      success: true,
      message: `Partner location link ${blocked ? "blocked" : "unblocked"} successfully`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Set Default ───────────────────────────────────────────
const updateDefaultStatus = async (req, res) => {
  try {
    const { isDefault } = req.body;

    if (typeof isDefault !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isDefault must be true or false",
      });
    }

    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Partner location link not found",
      });
    }

    const updated = await PartnerLocationLink.updateDefault(
      req.params.id,
      link.partner_no,
      isDefault,
    );

    res.status(200).json({
      success: true,
      message: `Partner location ${isDefault ? "set as default" : "removed from default"}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ────────────────────────────────────────────────
const deletePartnerLocationLink = async (req, res) => {
  try {
    const link = await PartnerLocationLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Partner location link not found",
      });
    }

    const deleted = await PartnerLocationLink.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Partner location link deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPartnerLocationLink,
  getAllPartnerLocationLinks,
  getPartnerLocationLinkById,
  getLinksByPartner,
  getDefaultLinkByPartner,
  updatePartnerLocationLink,
  updateBlockStatus,
  updateDefaultStatus,
  deletePartnerLocationLink,
};
