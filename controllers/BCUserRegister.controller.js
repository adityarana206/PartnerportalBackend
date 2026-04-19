const BCUserRegister = require("../models/BCUserRegister.model");
const bcService = require("../services/businessCentral.service");
const { isValidId, sanitizeString } = require("../utils/validation.utils");
const crypto = require("crypto");
const { pool } = require("../config/db");

const VALID_ENTITY_TYPES = [
  "", "LLC", "FZE", "FZCO", "Sole Establishment", "Partnership",
  "Public Joint Stock", "Private Joint Stock", "Branch Office", "Other",
];

// ─── Get Registration Options (for frontend dropdowns) ────
const getRegistrationOptions = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      entityTypes: VALID_ENTITY_TYPES.filter(Boolean),
    },
  });
};

const VALID_INVITE_ROLES = ["vendor", "customer"];

// ─── Generate Invite Link ─────────────────────────────────
const generateInvite = async (req, res) => {
  try {
    const { role, partnerNo, email, expiresInHours = 48 } = req.body;

    if (!role || !VALID_INVITE_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role is required. Allowed: ${VALID_INVITE_ROLES.join(", ")}`,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO registration_invites (token, role, partner_no, email, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [token, role, partnerNo || null, email || null, expiresAt]
    );

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    // const baseUrl =  "http://localhost:5173";
    const registrationUrl = `${baseUrl}/register?token=${token}`;

    return res.status(201).json({
      success: true,
      message: `Invite link generated for ${role}`,
      data: {
        token,
        role,
        partnerNo: partnerNo || null,
        email: email || null,
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

    const partnerNo = invite.partner_no || req.body.partnerNo || "";
    const inviteEmail = invite.email || "";

    const registrationData = {
      ...req.body,
      partnerType: invite.role === "vendor" ? "Vendor" : "Customer",
      partnerNo,
      email: req.body.email || inviteEmail,
      partnerEmail: req.body.partnerEmail || inviteEmail,
    };

    // ─── Save to local DB ────────────────────────────────────
    const local = await BCUserRegister.create({ ...registrationData, status: "Draft" });

    if (!local) {
      throw new Error("Local DB save failed");
    }

    let bcPatchResult = null;
    let bcPatchErr = null;
    let bcUpdateResult = null;
    let bcUpdateErr = null;

    if (partnerNo) {
      await BCUserRegister.updateStatus(local.id, "Pending");

      // ─── PATCH: set status on existing BC registration ────────
      try {
        bcPatchResult = await bcService.patchPartnerRegistration(
          partnerNo,
          "*",
          { status: "Pending_x0020_Approval" }
        );
        console.log("✅ BC PATCH succeeded for:", partnerNo);
      } catch (patchErr) {
        bcPatchErr = patchErr.response?.data || patchErr.message;
        console.error("⚠️  BC PATCH failed:", bcPatchErr);
      }

      // ─── updateRegistration action: send full form payload ─────
      try {
        bcUpdateResult = await bcService.updateRegistration(partnerNo, registrationData);
        console.log("✅ updateRegistration action called for:", partnerNo);
      } catch (updateErr) {
        bcUpdateErr = updateErr.response?.data || updateErr.message;
        console.error("⚠️  BC updateRegistration failed:", bcUpdateErr);
      }
    } else {
      console.warn("⚠️  No partnerNo — skipping BC PATCH and updateRegistration");
    }

    // Mark token as used
    await pool.query(`UPDATE registration_invites SET used = TRUE WHERE token = $1`, [token]);

    res.status(201).json({
      success: true,
      message: partnerNo ? "Registration submitted successfully" : "Registration saved locally (no BC reg number)",
      data: local,
      businessCentral: {
        synced: !!(bcPatchResult || bcUpdateResult),
        patch: { success: !!bcPatchResult, response: bcPatchResult, error: bcPatchErr },
        update: { success: !!bcUpdateResult, response: bcUpdateResult, error: bcUpdateErr },
      },
    });
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      detail: error.response?.data || null,
    });
  }
};

const getAllBCUserRegistrations = async (req, res) => {
  try {
    const requesterUserId = sanitizeString(req.query.requesterUserId);
    const status = sanitizeString(req.query.status);

    let registrations;
    try {
      if (requesterUserId) {
        registrations = await BCUserRegister.findByRequesterUserId(requesterUserId);
      } else if (status) {
        registrations = await BCUserRegister.findByStatus(status);
      } else {
        registrations = await BCUserRegister.findAll();
      }
    } catch (dbError) {
      console.error("Database error fetching registrations:", dbError);
      // Return empty array if table doesn't exist yet
      if (dbError.code === '42P01') { // Table doesn't exist
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: "Registration table not initialized"
        });
      }
      throw dbError;
    }

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error in getAllBCUserRegistrations:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
        email: invite.email || null,
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
  getRegistrationOptions,
};
