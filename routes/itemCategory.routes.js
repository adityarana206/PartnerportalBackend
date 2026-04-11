const express = require("express");
const router = express.Router();
const { getItemCategories, syncItemCategories } = require("../controllers/ItemCategory.controller");
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite } = require("../middleware/permission.middleware");

router.get("/", protect, canRead("ITEM_CATEGORIES"), getItemCategories);
router.post("/sync", protect, canWrite("ITEM_CATEGORIES"), syncItemCategories);

module.exports = router;
