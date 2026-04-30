const bcService = require("../services/businessCentral.service");

const getVendorLedgerEntries = async (req, res) => {
  try {
    const vendorNo = req.query.vendorNo || req.params.vendorNo;
    if (!vendorNo)
      return res.status(400).json({ success: false, message: "vendorNo is required" });
    const data = await bcService.getVendorLedgerEntries(vendorNo);
    const entries = data.value || [];
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getVendorLedgerEntries };
