const bcService = require("../services/businessCentral.service");
const Payment = require("../models/Payment.model");

const getCustomerPaymentHistory = async (req, res) => {
  try {
    const { customerNo } = req.body;
    if (!customerNo)
      return res.status(400).json({ success: false, message: "customerNo is required" });

    let records = [];
    let bcError = null;

    try {
      const data = await bcService.getCustomerPaymentHistory(customerNo);
      records = data.value || [];
      if (records[0]) {
        console.log("[BC CustomerPaymentHistory] RAW KEYS:", Object.keys(records[0]));
        console.log("[BC CustomerPaymentHistory] RAW FIRST:", JSON.stringify(records[0], null, 2));
      }
    } catch (err) {
      bcError = err.response?.data || err.message;
      console.error("[CustomerPaymentHistory] BC fetch failed:", bcError);
    }

    await Payment.deleteByPartnerNo(customerNo);

    const inserted = [];
    const skipped = [];

    for (const r of records) {
      try {
        const payment = await Payment.create({
          paymentNumber:    r.entryNo?.toString()    || "",
          referenceNo:      r.CustomerInvoiceNo || r.externalDocumentNo || r.documentNo || null,
          invoiceNo:        r.documentNo             || null,
          invoiceId:        r.appliesToDocNo         || r.documentNo   || null,
          orderNo:          r.externalDocumentNo     || null,
          partnerNo:        r.customerNo             || customerNo,
          amount:           r.amount                 ?? 0,
          paymentDate:      r.postingDate            || null,
          dueDate:          r.dueDate || r.documentDate || null,
          currencyCode:     r.currencyCode           || null,
          method:           r.paymentMethodCode      || null,
          description:      r.description           || null,
          customerName:     r.customerName           || null,
          appliesToDocNo:   r.appliesToDocNo         || null,
          appliesToDocType: r.appliesToDocType === "_x0020_" ? null : (r.appliesToDocType || null),
          status: (() => {
            const docType = (r.DocumentType || r.documentType || "").toLowerCase();
            if (docType === "payment" || docType === "credit memo") return "Completed";
            if (docType === "invoice") return r.open ? "Pending" : "Completed";
            return "Completed";
          })(),
        }, req.user?.id || null);
        inserted.push(payment);
      } catch (err) {
        skipped.push({ entryNo: r.entryNo, reason: err.message });
      }
    }

    // Normalize to consistent camelCase for frontend
    const normalized = records.map(r => ({
      entryNo:           r.entryNo,
      documentType:      r.DocumentType      || r.documentType      || "",
      documentNo:        r.documentNo        || "",
      customerInvoiceNo: r.CustomerInvoiceNo || r.externalDocumentNo || "",
      customerNo:        r.customerNo        || "",
      customerName:      r.customerName      || "",
      postingDate:       r.postingDate       || null,
      documentDate:      r.documentDate      || null,
      dueDate:           r.dueDate           || null,
      amount:            r.amount            ?? 0,
      amountLCY:         r.amountLCY         ?? 0,
      remainingAmount:   r.remainingAmount   ?? 0,
      currencyCode:      r.currencyCode      || "",
      description:       r.description      || "",
      appliesToDocNo:    r.appliesToDocNo    || "",
      appliesToDocType:  r.appliesToDocType === "_x0020_" ? "" : (r.appliesToDocType || ""),
      open:              r.open              ?? false,
      closedByEntryNo:   r.closedByEntryNo   || null,
      closedAtDate:      r.closedAtDate      || null,
      paymentMethodCode: r.paymentMethodCode || "",
      balAccountNo:      r.balAccountNo      || "",
    }));

    res.status(200).json({
      success: true,
      count:    records.length,
      inserted: inserted.length,
      skipped:  skipped.length,
      data:     normalized,
      ...(bcError && { bcError }),
    });
  } catch (error) {
    console.error("[CustomerPaymentHistory] Unexpected error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomerPaymentHistory };
