const bcService = require("../services/businessCentral.service");
const Payment = require("../models/Payment.model");

const getCustomerPaymentHistory = async (req, res) => {
  try {
    const { customerNo } = req.body;
    if (!customerNo)
      return res.status(400).json({ success: false, message: "customerNo is required" });

    const data = await bcService.getCustomerPaymentHistory(customerNo);
    const records = data.value || [];

    const inserted = [];
    for (const record of records) {
      try {
        const payment = await Payment.create({
          paymentNumber: record.entryNo?.toString() || record.documentNo || "",
          invoiceNo:     record.documentNo || null,
          orderNo:       record.externalDocumentNo || null,
          partnerNo:     record.customerNo || customerNo,
          amount:        record.amount ?? record.remainingAmount ?? 0,
          paymentDate:   record.postingDate || null,
          dueDate:       record.dueDate || null,
          currencyCode:  record.currencyCode || null,
          method:        record.paymentMethodCode || null,
          referenceNo:   record.documentNo || null,
          status:        "Completed",
        }, req.user?.id || null);
        inserted.push(payment);
      } catch (_) {
        // skip duplicates or constraint errors silently
      }
    }

    res.status(200).json({
      success: true,
      count: records.length,
      inserted: inserted.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomerPaymentHistory };
