const SalesShipment = require("../models/SalesShipment.model");
const NoSeries = require("../models/NoSeris.model");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

const createSalesShipment = async (req, res) => {
  try {
    const { shipmentNo, partnerNo, deliveryType } = req.body;

    if (!shipmentNo || !partnerNo) {
      return res.status(400).json({
        success: false,
        message: "shipmentNo and partnerNo are required",
      });
    }

    // Auto-generate portal document number
    const portalDocumentNo = await NoSeries.getNextNumberByCode("SHIP");

    const shipment = await SalesShipment.create({
      ...req.body,
      portalDocumentNo,
    });

    res.status(201).json({
      success: true,
      message: "Sales shipment created successfully",
      data: shipment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSalesShipments = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.query.partnerNo);

    let shipments;
    if (partnerNo) {
      shipments = await SalesShipment.findByPartnerNo(partnerNo);
    } else {
      shipments = await SalesShipment.findAll();
    }

    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalesShipmentById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const shipment = await SalesShipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Sales shipment not found",
      });
    }

    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalesShipmentByPortalDocNo = async (req, res) => {
  try {
    const portalDocumentNo = sanitizeString(req.params.portalDocumentNo);
    if (!portalDocumentNo) {
      return res.status(400).json({
        success: false,
        message: "Invalid portal document number",
      });
    }

    const shipment = await SalesShipment.findByPortalDocumentNo(portalDocumentNo);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Sales shipment not found",
      });
    }

    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSalesShipmentStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const { status } = req.body;
    const validStatuses = ["Inserted", "In Transit", "Delivered", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const shipment = await SalesShipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Sales shipment not found",
      });
    }

    const updated = await SalesShipment.updateStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Shipment status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSalesShipment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const shipment = await SalesShipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Sales shipment not found",
      });
    }

    const deleted = await SalesShipment.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Sales shipment deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSalesShipment,
  getAllSalesShipments,
  getSalesShipmentById,
  getSalesShipmentByPortalDocNo,
  updateSalesShipmentStatus,
  deleteSalesShipment,
};
