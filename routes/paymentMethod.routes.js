const express = require("express");
const router = express.Router();
const { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById } = require("../controllers/PaymentMethod.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createPaymentMethod);
router.get("/", getAllPaymentMethods);
router.get("/:id", getPaymentMethodById);

module.exports = router;
