const express = require("express");
const router = express.Router();
const { getAllUOM, getUOMById, createUOM, updateUOM, deleteUOM } = require("../controllers/UnitOfMeasure.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", getAllUOM);
router.get("/:id", protect, getUOMById);
router.post("/", protect, createUOM);
router.put("/:id", protect, updateUOM);
router.delete("/:id", protect, deleteUOM);

module.exports = router;
