const express = require("express");
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  getContactsByPartner,
  updateContact,
  updateSyncStatus,
  updatePortalAccess,
  deleteContact,
} = require("../controllers/ContactController");
const { protect, protectRegister } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("CONTACTS"), getAllContacts);
router.get("/partner/:partnerNo", protect, canRead("CONTACTS"), getContactsByPartner);
router.get("/:id", protect, canRead("CONTACTS"), getContactById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, canWrite("CONTACTS"), createContact);
router.post("/businesscentral",protectRegister , createContact);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("CONTACTS"), updateContact);
router.patch("/:id/sync", protect, canModify("CONTACTS"), updateSyncStatus);
router.patch("/:id/portal", protect, canModify("CONTACTS"), updatePortalAccess);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("CONTACTS"), deleteContact);

module.exports = router;
