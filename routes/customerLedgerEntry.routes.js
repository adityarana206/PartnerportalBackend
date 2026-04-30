const express = require("express");
const router = express.Router();
const { getCustomerLedgerEntries } = require("../controllers/CustomerLedgerEntry.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getCustomerLedgerEntries);
router.get("/:customerNo", protect, getCustomerLedgerEntries);

module.exports = router;
