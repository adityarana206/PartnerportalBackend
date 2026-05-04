const express = require("express");
const router = express.Router();
const { getVendorPaymentHistory, receiveVendorPaymentHistory } = require("../controllers/VendorPaymentHistory.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

router.post("/sync", receiveVendorPaymentHistory); // BC pushes here
router.post("/", protectRegister, getVendorPaymentHistory); // portal pulls from BC

module.exports = router;
