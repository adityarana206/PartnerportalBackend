const express = require("express");
const router = express.Router();
const {
  createSalesShipment,
  getAllSalesShipments,
  getSalesShipmentById,
  getSalesShipmentByPortalDocNo,
  updateSalesShipmentStatus,
  deleteSalesShipment,
} = require("../controllers/SalesShipment.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// READ
router.get("/", protect, getAllSalesShipments);
router.get("/:id", protect, getSalesShipmentById);
router.get("/portal/:portalDocumentNo", protect, getSalesShipmentByPortalDocNo);

// WRITE
router.post("/", protect, createSalesShipment);
router.post("/businesscentral", protectRegister, createSalesShipment);

// MODIFY
router.patch("/:id/status", protect, updateSalesShipmentStatus);

// DELETE
router.delete("/:id", protect, deleteSalesShipment);

module.exports = router;
