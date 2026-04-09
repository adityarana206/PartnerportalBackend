const BCUserRegister = require("../models/BCUserRegister.model");
const bcService = require("../services/businessCentral.service");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

const createBCUserRegister = async (req, res) => {
  try {
    const { name, requesterUserId } = req.body;

    if (!name || !requesterUserId) {
      return res.status(400).json({
        success: false,
        message: "name and requesterUserId are required",
      });
    }

    const registration = await BCUserRegister.create(req.body);

    // ─── Send to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createPartnerRegistration(req.body);
      console.log("✅ Partner registration synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "BC user registration created successfully",
      data: registration,
      businessCentral: {
        synced: !!bcResponse,
        response: bcResponse,
        error: bcError,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBCUserRegistrations = async (req, res) => {
  try {
    const requesterUserId = sanitizeString(req.query.requesterUserId);
    const status = sanitizeString(req.query.status);

    let registrations;
    if (requesterUserId) {
      registrations = await BCUserRegister.findByRequesterUserId(requesterUserId);
    } else if (status) {
      registrations = await BCUserRegister.findByStatus(status);
    } else {
      registrations = await BCUserRegister.findAll();
    }

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBCUserRegisterById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const registration = await BCUserRegister.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "BC user registration not found",
      });
    }

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBCUserRegisterStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const { status } = req.body;
    const validStatuses = ["Draft", "Pending", "Approved", "Rejected", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const registration = await BCUserRegister.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "BC user registration not found",
      });
    }

    const updated = await BCUserRegister.updateStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Registration status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBCUserRegister = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const registration = await BCUserRegister.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "BC user registration not found",
      });
    }

    const deleted = await BCUserRegister.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "BC user registration deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBCUserRegister,
  getAllBCUserRegistrations,
  getBCUserRegisterById,
  updateBCUserRegisterStatus,
  deleteBCUserRegister,
};
