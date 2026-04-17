const express = require("express");
const router = express.Router();
const { getItemCategories, syncItemCategories } = require("../controllers/ItemCategory.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getItemCategories);
router.post("/sync", protect, syncItemCategories);

module.exports = router;
