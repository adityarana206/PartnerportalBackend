const express = require("express");
const router = express.Router();
const { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById } = require("../controllers/PaymentMethod.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createPaymentMethod);
router.get("/", protect, getAllPaymentMethods);
router.get("/:id", protect, getPaymentMethodById);

module.exports = router;
