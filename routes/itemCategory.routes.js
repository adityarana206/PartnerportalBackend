const express = require("express");
const router = express.Router();
const { getItemCategories, syncItemCategories } = require("../controllers/ItemCategory.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

router.get("/", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getItemCategories);
router.post("/sync", protect, authorizeRoles("vendor_admin", "super_admin"), syncItemCategories);

module.exports = router;
