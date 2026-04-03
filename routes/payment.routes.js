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
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

router.get("/", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getAllPayments);
router.get("/partner/:partnerNo", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getPaymentsByPartner);
router.get("/:id", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getPaymentById);
router.post("/", protect, authorizeRoles("vendor_admin", "super_admin"), createPayment);
router.put("/:id", protect, authorizeRoles("vendor_admin", "super_admin"), updatePayment);
router.patch("/:id/status", protect, authorizeRoles("vendor_admin", "super_admin"), updatePaymentStatus);
router.delete("/:id", protect, authorizeRoles("super_admin"), deletePayment);

module.exports = router;
