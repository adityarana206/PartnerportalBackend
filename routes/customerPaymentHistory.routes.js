const express = require("express");
const router = express.Router();
const { getCustomerPaymentHistory } = require("../controllers/CustomerPaymentHistory.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, getCustomerPaymentHistory);

module.exports = router;
