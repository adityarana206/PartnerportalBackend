const express = require("express");
const router = express.Router();
const {
  createPartnerLocationLink,
  getAllPartnerLocationLinks,
  getPartnerLocationLinkById,
  updatePartnerLocationLink,
  deletePartnerLocationLink,
  getLocationsFromBC,
  syncLocationsFromBC,
} = require("../controllers/PartnerLocationLink.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

router.get("/",                protect, getAllPartnerLocationLinks);
router.get("/bc/locations",    protect, getLocationsFromBC);
router.post("/bc/sync",        protect, syncLocationsFromBC);
router.get("/:id",             protect, getPartnerLocationLinkById);

router.post("/",               protect, createPartnerLocationLink);
router.post("/businesscentral", protectRegister, createPartnerLocationLink);

router.put("/:id",             protect, updatePartnerLocationLink);
router.delete("/:id",          protect, deletePartnerLocationLink);

module.exports = router;
