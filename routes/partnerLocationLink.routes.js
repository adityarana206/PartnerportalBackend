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
  getLocationsFromBC,
} = require("../controllers/PartnerLocationLink.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllPartnerLocationLinks);
router.get("/bc/locations", protect, getLocationsFromBC);
router.get("/partner/:partnerNo", protect, getLinksByPartner);
router.get("/partner/:partnerNo/default", protect, getDefaultLinkByPartner);
router.get("/:id", protect, getPartnerLocationLinkById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, createPartnerLocationLink);
router.post("/businesscentral", protectRegister, createPartnerLocationLink);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updatePartnerLocationLink);
router.patch("/:id/block", protect, updateBlockStatus);
router.patch("/:id/default", protect, updateDefaultStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deletePartnerLocationLink);

module.exports = router;
