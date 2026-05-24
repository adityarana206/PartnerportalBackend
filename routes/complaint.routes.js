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
  getThreadSummaries,
  replyToThread,
  replyToThreadFromBC,
} = require("../controllers/Complaint.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllComplaints);                          // ?partnerNo=X or ?threadId=X
router.get("/threads", protect, getThreadSummaries);                // one row per thread (sidebar)
router.get("/partner/:partnerNo", protect, getComplaintsByPartner);
router.get("/thread/:threadId", protect, getComplaintsByThread);
router.get("/:id", protect, getComplaintById);

// ─── WRITE ─────────────────────────────────────────────────
router.post("/", protect, createComplaint);
router.post("/businesscentral", protectRegister, createComplaintFromBC);
router.post("/thread/:threadId/reply", protect, replyToThread);                    // portal → local DB + BC sync
router.post("/thread/:threadId/reply/businesscentral", protectRegister, replyToThreadFromBC); // BC → local DB only

// ─── MODIFY ────────────────────────────────────────────────
router.patch("/:id/status", protect, updateComplaintStatus);
router.post("/:id/sync-bc", protect, syncComplaintToBC);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
