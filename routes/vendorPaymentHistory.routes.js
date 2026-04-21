const express = require("express");
const router = express.Router();
const { getVendorPaymentHistory } = require("../controllers/VendorPaymentHistory.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, getVendorPaymentHistory);

module.exports = router;
