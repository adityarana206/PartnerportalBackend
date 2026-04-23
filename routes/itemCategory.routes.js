const express = require("express");
const router = express.Router();
const { getItemCategories, getItemCategoriesFromBC, syncItemCategories } = require("../controllers/ItemCategory.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getItemCategories);
router.get("/bc", protect, getItemCategoriesFromBC);
router.post("/sync", protect, syncItemCategories);

module.exports = router;
