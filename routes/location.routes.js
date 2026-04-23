const express = require("express");
const router = express.Router();
const { getLocations } = require("../controllers/Location.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getLocations);

module.exports = router;
