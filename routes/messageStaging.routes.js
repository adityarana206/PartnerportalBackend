const express = require("express");
const router = express.Router();
const {
  createMessage,
  getAllMessages,
  getMessageById,
  getMessagesByPartner,
  getMessagesByThread,
  updateMessageStatus,
  deleteMessage,
} = require("../controllers/MessageStaging.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllMessages);                              // ?partnerNo=X or ?threadId=X
router.get("/partner/:partnerNo", protect, getMessagesByPartner);
router.get("/thread/:threadId", protect, getMessagesByThread);
router.get("/:id", protect, getMessageById);

// ─── WRITE ─────────────────────────────────────────────────
router.post("/", protect, createMessage);
router.post("/businesscentral", protectRegister, createMessage);

// ─── MODIFY ────────────────────────────────────────────────
router.patch("/:id/status", protect, updateMessageStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deleteMessage);

module.exports = router;
