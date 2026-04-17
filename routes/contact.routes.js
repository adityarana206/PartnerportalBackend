const express = require("express");
const router = express.Router();
const {
  createContact,
  createContactbc,
  getAllContacts,
  getContactById,
  getContactsByPartner,
  updateContact,
  updateSyncStatus,
  updatePortalAccess,
  deleteContact,
} = require("../controllers/ContactController");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllContacts);
router.get("/partner/:partnerNo", protect, getContactsByPartner);
router.get("/:id", protect, getContactById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, createContact);
router.post("/businesscentral", protectRegister, createContactbc);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updateContact);
router.patch("/:id/sync", protect, updateSyncStatus);
router.patch("/:id/portal", protect, updatePortalAccess);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deleteContact);

module.exports = router;
