const express = require("express");
const router = express.Router();
const { getAllUOM, getUOMById, createUOM, updateUOM, deleteUOM } = require("../controllers/UnitOfMeasure.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

router.get("/", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getAllUOM);
router.get("/:id", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getUOMById);
router.post("/", protect, authorizeRoles("vendor_admin", "super_admin"), createUOM);
router.put("/:id", protect, authorizeRoles("vendor_admin", "super_admin"), updateUOM);
router.delete("/:id", protect, authorizeRoles("super_admin"), deleteUOM);

module.exports = router;
