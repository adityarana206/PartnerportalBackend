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
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

router.get("/", protect, canRead("PAYMENTS"), getAllPayments);
router.get("/partner/:partnerNo", protect, canRead("PAYMENTS"), getPaymentsByPartner);
router.get("/:id", protect, canRead("PAYMENTS"), getPaymentById);
router.post("/", protect, canWrite("PAYMENTS"), createPayment);
router.put("/:id", protect, canModify("PAYMENTS"), updatePayment);
router.patch("/:id/status", protect, canModify("PAYMENTS"), updatePaymentStatus);
router.delete("/:id", protect, canDelete("PAYMENTS"), deletePayment);

module.exports = router;
