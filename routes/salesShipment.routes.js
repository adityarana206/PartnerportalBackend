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
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// READ
router.get("/", protect, canRead("SALES_SHIPMENTS"), getAllSalesShipments);
router.get("/:id", protect, canRead("SALES_SHIPMENTS"), getSalesShipmentById);
router.get("/portal/:portalDocumentNo", protect, canRead("SALES_SHIPMENTS"), getSalesShipmentByPortalDocNo);

// WRITE
router.post("/", protect, canWrite("SALES_SHIPMENTS"), createSalesShipment);

// MODIFY
router.patch("/:id/status", protect, canModify("SALES_SHIPMENTS"), updateSalesShipmentStatus);

// DELETE
router.delete("/:id", protect, canDelete("SALES_SHIPMENTS"), deleteSalesShipment);

module.exports = router;
