const express = require("express");
const router = express.Router();
const { getItemCategories, getItemCategoriesFromBC, syncItemCategories, deleteItemCategory } = require("../controllers/ItemCategory.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getItemCategories);
router.get("/bc", protect, getItemCategoriesFromBC);
router.post("/sync", protect, syncItemCategories);
router.delete("/:code", protect, deleteItemCategory);

module.exports = router;
