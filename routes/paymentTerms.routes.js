const express = require("express");
const router = express.Router();
const { createPaymentTerm, getAllPaymentTerms, getPaymentTermById, updatePaymentTerm, deletePaymentTerm } = require("../controllers/PaymentTerms.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createPaymentTerm);
router.get("/", getAllPaymentTerms);
router.get("/:id", getPaymentTermById);
router.put("/:id", protect, updatePaymentTerm);
router.delete("/:id", protect, deletePaymentTerm);

module.exports = router;
