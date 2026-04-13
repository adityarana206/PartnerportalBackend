const express = require("express");
const router = express.Router();
const { getAllUOM, getUOMById, createUOM, updateUOM, deleteUOM } = require("../controllers/UnitOfMeasure.controller");
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

router.get("/", getAllUOM);
router.get("/:id", protect, canRead("UNIT_OF_MEASURES"), getUOMById);
router.post("/", protect, canWrite("UNIT_OF_MEASURES"), createUOM);
router.put("/:id", protect, canModify("UNIT_OF_MEASURES"), updateUOM);
router.delete("/:id", protect, canDelete("UNIT_OF_MEASURES"), deleteUOM);

module.exports = router;
