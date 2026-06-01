const express = require("express");
const router = express.Router();
const { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById, updatePaymentMethod, deletePaymentMethod, syncPaymentMethodsFromBC } = require("../controllers/PaymentMethod.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

router.post("/bc/sync", protect, isSuperAdmin, syncPaymentMethodsFromBC);
router.post("/", protect, createPaymentMethod);
router.get("/", getAllPaymentMethods);
router.get("/:id", getPaymentMethodById);
router.put("/:id", protect, updatePaymentMethod);
router.delete("/:id", protect, deletePaymentMethod);

module.exports = router;
