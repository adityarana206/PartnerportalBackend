const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  getPaymentsByPartner,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
} = require("../controllers/Payment.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getAllPayments);
router.get("/partner/:partnerNo", protect, getPaymentsByPartner);
router.get("/:id", protect, getPaymentById);
router.post("/", protect, createPayment);
router.put("/:id", protect, updatePayment);
router.patch("/:id/status", protect, updatePaymentStatus);
router.delete("/:id", protect, deletePayment);

module.exports = router;
