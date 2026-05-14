const BCUserRegister = require("../models/BCUserRegister.model");
const bcService = require("../services/businessCentral.service");
const { isValidId, sanitizeString } = require("../utils/validation.utils");
const crypto = require("crypto");
const { pool } = require("../config/db");
const PostCode = require("../models/PostCode.model");
const PaymentMethod = require("../models/PaymentMethod.model");
const PaymentTerms = require("../models/PaymentTerms.model");

const VALID_ENTITY_TYPES = [
  "", "LLC", "FZE", "FZCO", "Sole Establishment", "Partnership",
  "Public Joint Stock", "Private Joint Stock", "Branch Office", "Other",
];

// ─── Get Registration Options (for frontend dropdowns) ────
const getRegistrationOptions = async (req, res) => {
  try {
    const [postCodes, paymentMethods, paymentTerms] = await Promise.all([
      PostCode.findAll({}),
      PaymentMethod.findAll(),
      PaymentTerms.findAll(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        entityTypes: VALID_ENTITY_TYPES.filter(Boolean),
        postCodes:      postCodes.map(p => ({ code: p.code, city: p.city, countryCode: p.country_code ?? '' })),
        paymentMethods: paymentMethods.map(m => ({ code: m.code, description: m.description ?? '' })),
        paymentTerms:   paymentTerms.map(t => ({ code: t.code, description: t.description ?? '' })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const VALID_INVITE_ROLES = ["vendor", "customer"];

// ─── Generate Invite Link ─────────────────────────────────
const generateInvite = async (req, res) => {
  try {
    const { role, partnerNo, email, expiresInHours = 48, payload, regType } = req.body;

    if (!role || !VALID_INVITE_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role is required. Allowed: ${VALID_INVITE_ROLES.join(", ")}`,
      });
    }

    // Derive email from payload.header if not provided at top level
    const resolvedEmail = email || payload?.header?.partnerEmail || null;
    const resolvedPartnerNo = partnerNo || null;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO registration_invites (token, role, partner_no, email, expires_at, payload, reg_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [token, role, resolvedPartnerNo, resolvedEmail, expiresAt, payload ? JSON.stringify(payload) : null, regType || null]
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
        regType: regType || null,
        partnerNo: resolvedPartnerNo,
        email: resolvedEmail,
        expiresAt,
        registrationUrl,
        payload: payload || null,
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
    console.log("📥 Raw request body keys:", Object.keys(req.body));
    console.log("📥 req.body.documents exists:", !!req.body.documents);
    console.log("📥 req.body.documents type:", typeof req.body.documents);
    console.log("📥 req.body.documents length:", req.body.documents?.length);
    if (req.body.documents?.length > 0) {
      console.log("📥 First document from req.body:", JSON.stringify(req.body.documents[0], null, 2));
    }
    
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Invite token is required" });
    }

    const { valid, message: tokenMsg, invite } = await validateInviteToken(token);
    if (!valid) {
      return res.status(400).json({ success: false, message: tokenMsg });
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

    console.log("📄 registrationData.documents exists:", !!registrationData.documents);
    console.log("📄 registrationData.documents length:", registrationData.documents?.length || 0);
    if (registrationData.documents?.length > 0) {
      console.log("📄 First document in registrationData:", JSON.stringify(registrationData.documents[0], null, 2));
      console.log("📄 All document names:", registrationData.documents.map(d => d.name || d.fileName || 'unnamed'));
    } else {
      console.log("❌ NO DOCUMENTS IN registrationData!");
    }

    // ─── Save to local DB ────────────────────────────────────
    const local = await BCUserRegister.create({ ...registrationData, status: "Draft" });

    if (!local) {
      throw new Error("Local DB save failed");
    }

    let bcPatchResult = null;
    let bcPatchErr = null;
    let bcUpdateResult = null;
    let bcUpdateErr = null;
    let bcCreateResult = null;
    let bcCreateErr = null;

    const isUpdate = invite.reg_type === "update";

    if (partnerNo) {
      // ─── Check if registration exists in BC ───
      let existsInBC = false;
      try {
        await bcService.getPartnerRegistration(partnerNo);
        existsInBC = true;
        console.log("✅ Registration exists in BC:", partnerNo);
      } catch (getErr) {
        if (getErr.response?.status === 404) {
          console.log("ℹ️  Registration not found in BC, will create:", partnerNo);
        } else {
          console.error("⚠️  Error checking BC registration:", getErr.response?.data || getErr.message);
        }
      }

      if (existsInBC) {
        // ─── PATCH existing registration ───
        try {
          bcPatchResult = await bcService.patchPartnerRegistration(partnerNo, "*", { status: "Draft" });
          console.log("✅ BC PATCH status succeeded for:", partnerNo);
        } catch (patchErr) {
          bcPatchErr = patchErr.response?.data || patchErr.message;
          console.error("⚠️  BC PATCH failed:", bcPatchErr);
        }

        try {
          bcUpdateResult = await bcService.updateRegistration(partnerNo, registrationData);
          console.log("✅ BC updateRegistration succeeded for:", partnerNo);
        } catch (updateErr) {
          bcUpdateErr = updateErr.response?.data || updateErr.message;
          console.error("⚠️  BC updateRegistration failed:", bcUpdateErr);
        }

        // ─── POST documents/contacts/banks for existing registration ───
        const hasDocuments = registrationData.documents && registrationData.documents.length > 0;
        const hasContacts = registrationData.partnerRegContactLines && registrationData.partnerRegContactLines.length > 0;
        const hasBanks = registrationData.partnerRegBankLines && registrationData.partnerRegBankLines.length > 0;
        
        if (hasDocuments || hasContacts || hasBanks) {
          console.log("📎 Posting for existing registration:", partnerNo);
          console.log("   Documents:", registrationData.documents?.length || 0);
          console.log("   Contacts:", registrationData.partnerRegContactLines?.length || 0);
          console.log("   Banks:", registrationData.partnerRegBankLines?.length || 0);
          try {
            await bcService.postDocumentsForRegistration(
              partnerNo, 
              registrationData.documents,
              registrationData.partnerRegContactLines,
              registrationData.partnerRegBankLines
            );
            console.log("✅ Documents/contacts/banks posted successfully for:", partnerNo);
          } catch (docErr) {
            console.error("⚠️  Failed to post documents/contacts/banks:", docErr.response?.data || docErr.message);
          }
        }
      } else {
        // ─── POST to create new registration ───
        console.log("🆕 About to call createPartnerRegistration");
        console.log("🆕 registrationData has documents:", !!registrationData.documents);
        console.log("🆕 registrationData.documents length:", registrationData.documents?.length || 0);
        
        try {
          bcCreateResult = await bcService.createPartnerRegistration(registrationData);
          console.log("✅ BC createPartnerRegistration succeeded:", bcCreateResult?.no);

          if (bcCreateResult?.no) {
            await pool.query(
              `UPDATE bc_user_registrations SET partner_no = $1, updated_at = NOW() WHERE id = $2`,
              [bcCreateResult.no, local.id]
            );
            local.partner_no = bcCreateResult.no;
          }
        } catch (createErr) {
          bcCreateErr = createErr.response?.data || createErr.message;
          console.error("⚠️  BC createPartnerRegistration failed:", bcCreateErr);
        }
      }
    } else {
      // ─── No partnerNo: create new registration without a pre-assigned no ───
      console.log("🆕 No partnerNo on invite, creating new registration in BC");
      try {
        bcCreateResult = await bcService.createPartnerRegistration(registrationData);
        console.log("✅ BC createPartnerRegistration (no partnerNo) succeeded:", bcCreateResult?.no);

        if (bcCreateResult?.no) {
          await pool.query(
            `UPDATE bc_user_registrations SET partner_no = $1, updated_at = NOW() WHERE id = $2`,
            [bcCreateResult.no, local.id]
          );
          local.partner_no = bcCreateResult.no;
        }
      } catch (createErr) {
        bcCreateErr = createErr.response?.data || createErr.message;
        console.error("⚠️  BC createPartnerRegistration failed:", bcCreateErr);
      }
    }

    // Mark token as used
    await pool.query(`UPDATE registration_invites SET used = TRUE WHERE token = $1`, [token]);

    res.status(201).json({
      success: true,
      message: isUpdate ? "Details updated successfully" : "Registration submitted successfully",
      data: local,
      businessCentral: {
        synced: !!(bcPatchResult || bcUpdateResult || bcCreateResult),
        ...(bcCreateResult
          ? { create: { success: true, response: bcCreateResult, error: null } }
          : {
              patch:  { success: !!bcPatchResult,  response: bcPatchResult,  error: bcPatchErr },
              update: { success: !!bcUpdateResult, response: bcUpdateResult, error: bcUpdateErr },
            }
        ),
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
        regType: invite.reg_type || null,
        partnerNo: invite.partner_no,
        email: invite.email || null,
        expiresAt: invite.expires_at,
        payload: invite.payload || null,
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
