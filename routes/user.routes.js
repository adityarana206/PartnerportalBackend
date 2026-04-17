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
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

// ─── WRITE (Register) ──────────────────────────────────────
router.post("/register", register);

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAll);
router.get("/me", protect, getMe);
router.get("/:id", protect, getById);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, update);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, isSuperAdmin, remove);

module.exports = router;
