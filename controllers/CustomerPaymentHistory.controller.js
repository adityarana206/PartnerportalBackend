const bcService = require("../services/businessCentral.service");
const Payment = require("../models/Payment.model");

// Pull from BC (portal-initiated)
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
    } catch (err) {
      bcError = err.response?.data || err.message;
      console.error("[CustomerPaymentHistory] BC fetch failed:", bcError);
    }

    const { inserted, skipped } = await syncPayments(records, customerNo, req.user?.id || null);

    const normalized = normalizeCustomerRecords(records);

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

// Push from BC (BC-initiated sync)
const receiveCustomerPaymentHistory = async (req, res) => {
  try {
    const { customerNo, records } = req.body;

    if (!customerNo)
      return res.status(400).json({ success: false, message: "customerNo is required" });
    if (!Array.isArray(records) || records.length === 0)
      return res.status(400).json({ success: false, message: "records array is required" });

    const { inserted, skipped } = await syncPayments(records, customerNo, null);

    res.status(200).json({
      success:  true,
      count:    records.length,
      inserted: inserted.length,
      skipped:  skipped.length,
      data:     normalizeCustomerRecords(records),
    });
  } catch (error) {
    console.error("[CustomerPaymentHistory] Push error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Shared helpers ───────────────────────────────────────

async function syncPayments(records, partnerNo, userId) {
  const inserted = [];
  const skipped = [];

  for (const r of records) {
    try {
      const payment = await Payment.upsertByEntryNo({
        paymentNumber:    r.entryNo?.toString()                                    || "",
        referenceNo:      r.customerInvoiceNo || r.externalDocumentNo || r.documentNo || null,
        invoiceNo:        r.documentNo                                             || null,
        invoiceId:        r.appliesToDocNo    || r.documentNo                      || null,
        orderNo:          r.externalDocumentNo                                     || null,
        partnerNo:        r.customerNo        || partnerNo,
        amount:           r.amount            ?? 0,
        amountLCY:        r.amountLCY         ?? null,
        remainingAmount:  r.remainingAmount   ?? null,
        paymentDate:      r.postingDate                                            || null,
        postingDate:      r.postingDate                                            || null,
        documentDate:     r.documentDate                                           || null,
        dueDate:          r.dueDate           || r.documentDate                    || null,
        currencyCode:     r.currencyCode                                           || null,
        method:           r.paymentMethodCode                                      || null,
        description:      r.description                                            || null,
        documentType:     r.documentType                                           || null,
        documentNo:       r.documentNo                                             || null,
        customerName:     r.customerName                                           || null,
        appliesToDocNo:   r.appliesToDocNo                                         || null,
        appliesToDocType: r.appliesToDocType === "_x0020_" ? null : (r.appliesToDocType || null),
        open:             r.open             ?? null,
        closedByEntryNo:  r.closedByEntryNo                                        || null,
        closedAtDate:     r.closedAtDate                                           || null,
        balAccountNo:     r.balAccountNo                                           || null,
        status: (() => {
          const docType = (r.documentType || "").toLowerCase();
          if (docType === "payment" || docType === "credit memo") return "Completed";
          if (docType === "invoice") return r.open ? "Pending" : "Completed";
          return "Completed";
        })(),
      }, userId);
      inserted.push(payment);
    } catch (err) {
      skipped.push({ entryNo: r.entryNo, reason: err.message });
    }
  }

  return { inserted, skipped };
}

function normalizeCustomerRecords(records) {
  return records.map(r => ({
    entryNo:           r.entryNo,
    documentType:      r.documentType                                          || "",
    documentNo:        r.documentNo                                            || "",
    customerInvoiceNo: r.customerInvoiceNo || r.externalDocumentNo             || "",
    customerNo:        r.customerNo                                            || "",
    customerName:      r.customerName                                          || "",
    postingDate:       r.postingDate                                           || null,
    documentDate:      r.documentDate                                          || null,
    dueDate:           r.dueDate                                               || null,
    amount:            r.amount                                                ?? 0,
    amountLCY:         r.amountLCY                                             ?? 0,
    remainingAmount:   r.remainingAmount                                       ?? 0,
    currencyCode:      r.currencyCode                                          || "",
    description:       r.description                                           || "",
    appliesToDocNo:    r.appliesToDocNo                                        || "",
    appliesToDocType:  r.appliesToDocType === "_x0020_" ? "" : (r.appliesToDocType || ""),
    open:              r.open                                                  ?? false,
    closedByEntryNo:   r.closedByEntryNo                                       || null,
    closedAtDate:      r.closedAtDate                                          || null,
    paymentMethodCode: r.paymentMethodCode                                     || "",
    balAccountNo:      r.balAccountNo                                          || "",
  }));
}

module.exports = { getCustomerPaymentHistory, receiveCustomerPaymentHistory };
