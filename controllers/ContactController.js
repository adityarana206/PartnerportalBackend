const Contact = require("../models/Contact.model");
const bcService = require("../services/businessCentral.service");

// ─── Create Contact ────────────────────────────────────────
const createContact = async (req, res) => {
  try {
    if (!req.body.contactName) {
      return res.status(400).json({
        success: false,
        message: "Contact name is required",
      });
    }

    // ─── Check duplicate contactNo ─────────────────────────
    if (req.body.contactNo) {
      const existing = await Contact.findByContactNo(req.body.contactNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }
    }

    const contact = await Contact.create(req.body, req.user.id);

    // ─── Send to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createContactStaging(req.body);
      console.log("✅ Contact synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
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

// ─── Get All Contacts ──────────────────────────────────────
const getAllContacts = async (req, res) => {
  try {
    const { syncStatus, partnerNo, companyNo } = req.query;
    const { role } = req.user;

    let contacts;

    if (syncStatus) {
      contacts = await Contact.findBySyncStatus(syncStatus);
    } else if (partnerNo) {
      contacts = await Contact.findByPartnerNo(partnerNo);
    } else if (companyNo) {
      contacts = await Contact.findByCompanyNo(companyNo);
    } else {
      contacts = await Contact.findAll();
    }

    // ─── customer sees only their own contacts ─────────────
    if (role === "customer") {
      contacts = contacts.filter((c) => c.created_by === req.user.id);
    }

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Contact by ID ─────────────────────────────────────
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // ─── customer sees only own contacts ───────────────────
    if (req.user.role === "customer" && contact.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Contacts by Partner No ────────────────────────────
const getContactsByPartner = async (req, res) => {
  try {
    const contacts = await Contact.findByPartnerNo(req.params.partnerNo);
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Contact ────────────────────────────────────────
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // ─── customer can only update own contacts ─────────────
    if (req.user.role === "customer" && contact.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own contacts",
      });
    }

    // ─── Check duplicate contactNo if changed ──────────────
    if (req.body.contactNo && req.body.contactNo !== contact.contact_no) {
      const existing = await Contact.findByContactNo(req.body.contactNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }
    }

    const updated = await Contact.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Sync Status (customer_admin + super_admin) ─────
const updateSyncStatus = async (req, res) => {
  try {
    const { syncStatus } = req.body;

    const validStatuses = ["Pending", "Synced", "Failed"];
    if (!syncStatus || !validStatuses.includes(syncStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sync status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    const updated = await Contact.updateSyncStatus(req.params.id, syncStatus);
    res.status(200).json({
      success: true,
      message: `Sync status updated to ${syncStatus}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Portal Access (customer_admin + super_admin) ───
const updatePortalAccess = async (req, res) => {
  try {
    const { portalUser, portalAdmin } = req.body;

    if (typeof portalUser !== "boolean" || typeof portalAdmin !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "portalUser and portalAdmin must be true or false",
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    const updated = await Contact.updatePortalAccess(
      req.params.id,
      portalUser,
      portalAdmin,
    );
    res.status(200).json({
      success: true,
      message: "Portal access updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Contact (customer_admin + super_admin) ─────────
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    const deleted = await Contact.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  getContactsByPartner,
  updateContact,
  updateSyncStatus,
  updatePortalAccess,
  deleteContact,
};
