const express = require("express");
const router = express.Router();
const {
  createCountry,
  getAllCountries,
  getActiveCountry,
  getCountryById,
  updateCountry,
  activateCountry,
  deleteCountry,
} = require("../controllers/Country.controller");
const { protect } = require("../middleware/auth.middleware");

// Public routes for registration forms
router.get("/active", getActiveCountry);
router.get("/", getAllCountries);

// Protected routes
router.get("/:id", protect, getCountryById);
router.post("/", protect, createCountry);
router.put("/:id", protect, updateCountry);
router.patch("/:id/activate", protect, activateCountry);
router.delete("/:id", protect, deleteCountry);

module.exports = router;
