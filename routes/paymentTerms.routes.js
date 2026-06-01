const express = require("express");
const router = express.Router();
const { createPaymentTerm, getAllPaymentTerms, getPaymentTermById, updatePaymentTerm, deletePaymentTerm, syncPaymentTermsFromBC } = require("../controllers/PaymentTerms.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

router.post("/bc/sync", protect, isSuperAdmin, syncPaymentTermsFromBC);
router.post("/", protect, createPaymentTerm);
router.get("/", getAllPaymentTerms);
router.get("/:id", getPaymentTermById);
router.put("/:id", protect, updatePaymentTerm);
router.delete("/:id", protect, deletePaymentTerm);

module.exports = router;
