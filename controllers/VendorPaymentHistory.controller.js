const bcService = require("../services/businessCentral.service");
const Payment = require("../models/Payment.model");

const getVendorPaymentHistory = async (req, res) => {
  try {
    const { vendorNo } = req.body;
    if (!vendorNo)
      return res.status(400).json({ success: false, message: "vendorNo is required" });

    let records = [];
    let bcError = null;

    try {
      const data = await bcService.getVendorPaymentHistory(vendorNo);
      records = data.value || [];
    } catch (err) {
      bcError = err.response?.data || err.message;
      console.error("[VendorPaymentHistory] BC fetch failed:", bcError);
    }

    await Payment.deleteByPartnerNo(vendorNo);

    const inserted = [];
    const skipped = [];

    for (const r of records) {
      try {
        const payment = await Payment.create({
          paymentNumber:    r.entryNo?.toString()    || "",
          referenceNo:      r.VendorInvoiceNo        || r.documentNo   || null,
          invoiceNo:        r.documentNo             || null,
          invoiceId:        r.appliesToDocNo         || r.documentNo   || null,
          orderNo:          null,
          partnerNo:        r.vendorNo               || vendorNo,
          amount:           r.amount                 ?? 0,
          paymentDate:      r.postingDate            || null,
          dueDate:          r.documentDate           || null,
          currencyCode:     r.currencyCode           || null,
          method:           r.paymentMethodCode      || null,
          description:      r.description           || null,
          vendorName:       r.vendorName             || null,
          appliesToDocNo:   r.appliesToDocNo         || null,
          appliesToDocType: r.appliesToDocType === "_x0020_" ? null : (r.appliesToDocType || null),
          status: (() => {
            const docType = (r.DocumentType || "").toLowerCase();
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

    // Normalize response to consistent camelCase for frontend
    const normalized = records.map(r => ({
      entryNo:          r.entryNo,
      documentType:     r.DocumentType             || "",
      documentNo:       r.documentNo               || "",
      vendorInvoiceNo:  r.VendorInvoiceNo          || "",
      vendorNo:         r.vendorNo                 || "",
      vendorName:       r.vendorName               || "",
      postingDate:      r.postingDate              || null,
      documentDate:     r.documentDate             || null,
      amount:           r.amount                   ?? 0,
      amountLCY:        r.amountLCY                ?? 0,
      remainingAmount:  r.remainingAmount          ?? 0,
      currencyCode:     r.currencyCode             || "",
      description:      r.description             || "",
      appliesToDocNo:   r.appliesToDocNo           || "",
      appliesToDocType: r.appliesToDocType === "_x0020_" ? "" : (r.appliesToDocType || ""),
      open:             r.open                     ?? false,
      closedByEntryNo:  r.closedByEntryNo          || null,
      closedAtDate:     r.closedAtDate             || null,
      paymentMethodCode:r.paymentMethodCode        || "",
      balAccountNo:     r.balAccountNo             || "",
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
    console.error("[VendorPaymentHistory] Unexpected error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getVendorPaymentHistory };
