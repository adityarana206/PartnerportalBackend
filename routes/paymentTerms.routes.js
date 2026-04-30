const express = require("express");
const router = express.Router();
const { createPaymentTerm, getAllPaymentTerms, getPaymentTermById } = require("../controllers/PaymentTerms.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createPaymentTerm);
router.get("/", getAllPaymentTerms);
router.get("/:id", getPaymentTermById);

module.exports = router;
