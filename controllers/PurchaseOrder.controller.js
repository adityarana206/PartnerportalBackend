const PurchaseOrder = require("../models/PurchaseOrder.model");
const PartnerLocationLink = require("../models/PartnerLocationLink.model");
const bcService = require("../services/businessCentral.service");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

// ─── Create Purchase Order ─────────────────────────────────
const createPurchaseOrder = async (req, res) => {
  try {
    if (!req.body.partnerNo) {
      return res.status(400).json({ success: false, message: "Partner number is required" });
    }
    if (!req.body.orderStagingLines || req.body.orderStagingLines.length === 0) {
      return res.status(400).json({ success: false, message: "At least one order line is required" });
    }

    let bcResponse = null;
    let bcError = null;
    try {
      const bcData = { ...req.body, orderType: "Purchase_x0020_Order" };
      bcResponse = await bcService.createOrderStaging(bcData);
      console.log("✅ Purchase Order synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createPurchaseOrderbc = async (req, res) => {
  try {
    if (!req.body.partnerNo) {
      return res.status(400).json({ success: false, message: "Partner number is required" });
    }

    const lines = req.body.lines || req.body.orderStagingLines || [];
    if (!lines.length) {
      return res.status(400).json({ success: false, message: "At least one order line is required" });
    }

    const normalized = {
      orderType:              req.body.orderType || null,
      No:                     req.body.no || req.body.No || null,
      partnerNo:              req.body.partnerNo,
      partnerType:            req.body.partnerType || null,
      shipToCode:             req.body.shipToCode || null,
      locationCode:           req.body.locationCode || null,
      orderDate:              req.body.orderDate || null,
      requestedDeliveryDate:  req.body.requestedDeliveryDate || null,
      currencyCode:           req.body.currencyCode || null,
      externalDocumentNo:     req.body.externalDocumentNo || null,
      status:                 req.body.status || 'Open',
      direction:              req.body.direction || null,
      submittedDate:          req.body.submittedDate || null,
      orderStagingLines: lines.map(l => ({
        documentNo:           l.lineDocumentNo || l.documentNo || null,
        lineNo:               l.lineNo || null,
        itemNo:               l.itemNo || null,
        description:          l.description || null,
        quantity:             l.quantity || 0,
        unitOfMeasureCode:    l.unitOfMeasureCode || null,
        unitPrice:            l.unitPrice || 0,
        lineDiscountPercent:  l.lineDiscountPercent || 0,
        lineDiscountAmount:   l.lineDiscountAmount || 0,
        lineAmount:           l.lineAmount || 0,
        lineAmountInclVat:    l.lineAmountInclVat || l.lineAmountIncludingVat || 0,
        vatCode:              l.vatCode || null,
        vatPercent:           l.vatPercent || 0,
        vatAmount:            l.vatAmount || 0,
        locationCode:         l.locationCode || null,
        deliveryDate:         l.deliveryDate || null,
        variantCode:          l.variantCode || null,
      })),
    };

    const userId = req.user ? req.user.id : null;
    const order = await PurchaseOrder.create(normalized, userId);
    res.status(201).json({ success: true, message: "Purchase order created successfully", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── Get POs eligible for DO (Accepted) ──────
const getEligiblePOsForDO = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.query.partnerNo);
    const orders = await PurchaseOrder.findEligibleForDO(partnerNo || null);
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLocationsForPartner = async (req, res) => {
  try {
    const all = await PartnerLocationLink.findAll();
    const locations = all.filter(l => !l.blocked);
    res.status(200).json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApprovedItemsForPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const items = await PurchaseOrder.findApprovedItemsByPartner(partnerNo);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApprovedItemDetail = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    const batchNo = sanitizeString(req.params.batchNo);
    const item = await PurchaseOrder.findApprovedItemDetail(partnerNo, batchNo);
    if (!item)
      return res.status(404).json({ success: false, message: "Approved item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Purchase Orders ───────────────────────────────
const getAllPurchaseOrders = async (req, res) => {
  try {
    const status = sanitizeString(req.query.status);
    const partnerNo = sanitizeString(req.query.partnerNo);

    let orders;
    if (status) {
      orders = await PurchaseOrder.findByStatus(status);
    } else if (partnerNo) {
      orders = await PurchaseOrder.findByPartnerNo(partnerNo);
    } else {
      orders = await PurchaseOrder.findAll();
    }

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Purchase Order by ID ──────────────────────────────
const getPurchaseOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Orders by Partner No ──────────────────────────────
const getOrdersByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const orders = await PurchaseOrder.findByPartnerNo(partnerNo);
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPurchaseOrderBCConfirm = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Purchase order not found" });

    const documentNo = order.no || order.external_document_no;
    if (!documentNo)
      return res.status(400).json({ success: false, message: "Purchase order does not have a BC document number" });

    const bcResponse = await bcService.getPurchaseOrderConfirmByDocumentNo(documentNo);
    const bcConfirm = Array.isArray(bcResponse.value) ? bcResponse.value[0] : null;
    if (!bcConfirm)
      return res.status(404).json({ success: false, message: `BC confirm record not found for documentNo ${documentNo}` });

    res.status(200).json({ success: true, data: { bcConfirmId: bcConfirm.id || null, bcConfirm } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Purchase Order ─────────────────────────────────
const updatePurchaseOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    if (!req.body.orderStagingLines || req.body.orderStagingLines.length === 0)
      return res.status(400).json({ success: false, message: "At least one order line is required" });

    const updated = await PurchaseOrder.update(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Purchase order updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Status Only ────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const { status, portalStatus, portalDocumentNo } = req.body;

    const validStatuses = ["Released", "Accepted", "Rejected", "Processed for DO"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Purchase order not found" });

    const documentNo = order.no || order.external_document_no;
    console.log(`[PO Status Update] Order ${req.params.id} → status: ${status}, portalStatus: ${portalStatus}, portalDocumentNo: ${portalDocumentNo}, documentNo: ${documentNo}`);

    let bcResponse = null;
    let bcSyncError = null;

    if (documentNo) {
      try {
        const confirmResponse = await bcService.getPurchaseOrderConfirmByDocumentNo(documentNo);
        const bcConfirm = Array.isArray(confirmResponse.value) ? confirmResponse.value[0] : null;

        console.log(`[PO Status Update] BC confirm record:`, JSON.stringify(bcConfirm));

        const bcGuid = bcConfirm?.systemId || bcConfirm?.id;
        if (!bcConfirm || !bcGuid) {
          console.warn(`[PO Status Update] No BC confirm record found for documentNo: ${documentNo}`);
          bcSyncError = `No BC confirm record found for documentNo: ${documentNo}`;
        } else {
          const bcPayload = {
            vendorConfirmed: status === "Accepted" ? "true" : "false",
            ...(portalStatus      && { portalStatus }),
            ...(portalDocumentNo  && { portalDocumentNo }),
          };
          console.log(`[PO Status Update] Patching BC GUID ${bcGuid} with:`, bcPayload);
          bcResponse = await bcService.patchPurchaseOrderConfirmByGuid(bcGuid, bcPayload);
          console.log(`[PO Status Update] BC patch successful`);
        }
      } catch (bcError) {
        bcSyncError = bcError.response?.data || bcError.message;
        console.error(`[PO Status Update] BC sync failed:`, {
          httpStatus: bcError.response?.status,
          data: bcError.response?.data,
          url: bcError.config?.url,
        });
      }
    }

    const updated = await PurchaseOrder.updateStatus(req.params.id, status, portalStatus, portalDocumentNo);
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated,
      businessCentral: {
        synced: !!bcResponse,
        response: bcResponse,
        error: bcSyncError,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Purchase Order ─────────────────────────────────
const deletePurchaseOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Purchase order not found" });

    const deleted = await PurchaseOrder.delete(req.params.id);
    res.status(200).json({ success: true, message: "Purchase order deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getOrdersByPartner,
  updatePurchaseOrder,
  updateOrderStatus,
  deletePurchaseOrder,
  createPurchaseOrderbc,
  getPurchaseOrderBCConfirm,
  getApprovedItemsForPartner,
  getApprovedItemDetail,
  getLocationsForPartner,
  getEligiblePOsForDO,
};
