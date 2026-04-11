const express = require("express");
const router = express.Router();
const {
  createPartnerLocationLink,
  getAllPartnerLocationLinks,
  getPartnerLocationLinkById,
  getLinksByPartner,
  getDefaultLinkByPartner,
  updatePartnerLocationLink,
  updateBlockStatus,
  updateDefaultStatus,
  deletePartnerLocationLink,
} = require("../controllers/PartnerLocationLink.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("PARTNER_LOCATION_LINKS"), getAllPartnerLocationLinks);
router.get("/partner/:partnerNo", protect, canRead("PARTNER_LOCATION_LINKS"), getLinksByPartner);
router.get("/partner/:partnerNo/default", protect, canRead("PARTNER_LOCATION_LINKS"), getDefaultLinkByPartner);
router.get("/:id", protect, canRead("PARTNER_LOCATION_LINKS"), getPartnerLocationLinkById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, canWrite("PARTNER_LOCATION_LINKS"), createPartnerLocationLink);
router.post("/businesscentral", protectRegister, createPartnerLocationLink);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("PARTNER_LOCATION_LINKS"), updatePartnerLocationLink);
router.patch("/:id/block", protect, canModify("PARTNER_LOCATION_LINKS"), updateBlockStatus);
router.patch("/:id/default", protect, canModify("PARTNER_LOCATION_LINKS"), updateDefaultStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("PARTNER_LOCATION_LINKS"), deletePartnerLocationLink);

module.exports = router;
