const express = require("express");
const router = express.Router();
const { getVendorLedgerEntries } = require("../controllers/VendorLedgerEntry.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getVendorLedgerEntries);
router.get("/:vendorNo", protect, getVendorLedgerEntries);

module.exports = router;
