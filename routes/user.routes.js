const express = require("express");
const router = express.Router();
const {
  register,
  getAll,
  getById,
  getMe,
  update,
  remove,
} = require("../controllers/Customer.controller");
const { protect, protectRegister, isSuperAdmin } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── WRITE (Register) ──────────────────────────────────────
router.post("/register", protectRegister, register);

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("USERS"), getAll);
router.get("/me", protect, getMe);
router.get("/:id", protect, canRead("USERS"), getById);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("USERS"), update);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, isSuperAdmin, remove);

module.exports = router;
