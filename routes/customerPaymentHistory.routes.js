const express = require("express");
const router = express.Router();
const { getCustomerPaymentHistory, receiveCustomerPaymentHistory } = require("../controllers/CustomerPaymentHistory.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

router.post("/sync", receiveCustomerPaymentHistory); // BC pushes here
router.post("/", protectRegister, getCustomerPaymentHistory); // portal pulls from BC

module.exports = router;
