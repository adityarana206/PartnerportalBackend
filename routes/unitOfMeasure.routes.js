const express = require("express");
const router = express.Router();
const { getAllUOM, getUOMById, createUOM, updateUOM, deleteUOM, syncUOMFromBC } = require("../controllers/UnitOfMeasure.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

router.get("/", getAllUOM);
router.post("/bc/sync", protect, isSuperAdmin, syncUOMFromBC);
router.get("/:id", protect, getUOMById);
router.post("/", protect, createUOM);
router.put("/:id", protect, updateUOM);
router.delete("/:id", protect, deleteUOM);

module.exports = router;
