const bcService = require("../services/businessCentral.service");

const getCustomerLedgerEntries = async (req, res) => {
  try {
    const customerNo = req.query.customerNo || req.params.customerNo;
    if (!customerNo)
      return res.status(400).json({ success: false, message: "customerNo is required" });
    const data = await bcService.getCustomerLedgerEntries(customerNo);
    const entries = data.value || [];
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomerLedgerEntries };
