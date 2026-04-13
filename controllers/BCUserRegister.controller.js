const BCUserRegister = require("../models/BCUserRegister.model");
const bcService = require("../services/businessCentral.service");
const { isValidId, sanitizeString } = require("../utils/validation.utils");
const crypto = require("crypto");
const { pool } = require("../config/db");

const VALID_INVITE_ROLES = ["vendor", "customer"];

// ─── Generate Invite Link ─────────────────────────────────
const generateInvite = async (req, res) => {
  try {
    const { role, partnerNo, expiresInHours = 48 } = req.body;

    if (!role || !VALID_INVITE_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role is required. Allowed: ${VALID_INVITE_ROLES.join(", ")}`,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO registration_invites (token, role, partner_no, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [token, role, partnerNo || null, expiresAt]
    );

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const registrationUrl = `${baseUrl}/register?token=${token}`;

    return res.status(201).json({
      success: true,
      message: `Invite link generated for ${role}`,
      data: {
        token,
        role,
        partnerNo: partnerNo || null,
        expiresAt,
        registrationUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Validate Invite Token ────────────────────────────────
const validateInviteToken = async (token) => {
  const result = await pool.query(
    `SELECT * FROM registration_invites WHERE token = $1`,
    [token]
  );
  const invite = result.rows[0];
  if (!invite) return { valid: false, message: "Invalid invite token" };
  if (invite.used) return { valid: false, message: "Invite token has already been used" };
  if (new Date() > new Date(invite.expires_at))
    return { valid: false, message: "Invite token has expired" };
  return { valid: true, invite };
};

const createBCUserRegister = async (req, res) => {
  try {
    const { name, requesterUserId, token } = req.body;

    // ─── Validate invite token ────────────────────────────
    if (!token) {
      return res.status(400).json({ success: false, message: "Invite token is required" });
    }

    const { valid, message: tokenMsg, invite } = await validateInviteToken(token);
    if (!valid) {
      return res.status(400).json({ success: false, message: tokenMsg });
    }

    if (!name || !requesterUserId) {
      return res.status(400).json({
        success: false,
        message: "name and requesterUserId are required",
      });
    }

    // Merge invite data (role → partnerType, partnerNo) into body
    const registrationData = {
      ...req.body,
      partnerType: invite.role === "vendor" ? "Vendor" : "Customer",
      partnerNo: invite.partner_no || req.body.partnerNo || "",
    };

    const registration = await BCUserRegister.create(registrationData);

    // Mark token as used
    await pool.query(
      `UPDATE registration_invites SET used = TRUE WHERE token = $1`,
      [token]
    );

    // ─── Send to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createPartnerRegistration(registrationData);
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

// ─── Verify Invite Token (GET) ───────────────────────────
const verifyInvite = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: "Token is required" });

    const { valid, message: tokenMsg, invite } = await validateInviteToken(token);
    if (!valid)
      return res.status(400).json({ success: false, message: tokenMsg });

    return res.status(200).json({
      success: true,
      data: {
        role: invite.role,
        partnerNo: invite.partner_no,
        expiresAt: invite.expires_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateInvite,
  verifyInvite,
  createBCUserRegister,
  getAllBCUserRegistrations,
  getBCUserRegisterById,
  updateBCUserRegisterStatus,
  deleteBCUserRegister,
};
