const express = require("express");
const router = express.Router();
const {
  createComplaint,
  createComplaintFromBC,
  getAllComplaints,
  getComplaintById,
  getComplaintsByPartner,
  getComplaintsByThread,
  updateComplaintStatus,
  syncComplaintToBC,
  deleteComplaint,
} = require("../controllers/Complaint.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllComplaints);                          // ?partnerNo=X or ?threadId=X
router.get("/partner/:partnerNo", protect, getComplaintsByPartner);
router.get("/thread/:threadId", protect, getComplaintsByThread);
router.get("/:id", protect, getComplaintById);

// ─── WRITE ─────────────────────────────────────────────────
router.post("/", protect, createComplaint);
router.post("/businesscentral", protectRegister, createComplaintFromBC);

// ─── MODIFY ────────────────────────────────────────────────
router.patch("/:id/status", protect, updateComplaintStatus);
router.post("/:id/sync-bc", protect, syncComplaintToBC);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
