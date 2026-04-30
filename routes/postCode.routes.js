const express = require("express");
const router = express.Router();
const {
  syncPostCodes,
  getAllPostCodes,
  getPostCodeById,
  updatePostCode,
  deletePostCode,
} = require("../controllers/PostCode.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

// Super admin only — sync from BC, update, delete
router.post("/sync", protect, isSuperAdmin, syncPostCodes);
router.put("/:id", protect, isSuperAdmin, updatePostCode);
router.delete("/:id", protect, isSuperAdmin, deletePostCode);

// All authenticated users — read
router.get("/", getAllPostCodes);
router.get("/:id", getPostCodeById);

module.exports = router;
