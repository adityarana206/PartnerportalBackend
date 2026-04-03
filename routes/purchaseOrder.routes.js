const express = require("express");
const router = express.Router();
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getOrdersByPartner,
  updatePurchaseOrder,
  updateOrderStatus,
  deletePurchaseOrder,
  createPurchaseOrderbc,
  getApprovedItemsForPartner,
  getApprovedItemDetail,
  getLocationsForPartner,
} = require("../controllers/PurchaseOrder.controller");
const { protect, authorizeRoles, protectRegister } = require("../middleware/auth.middleware");

router.post("/", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), createPurchaseOrder);
router.post("/businesscentral", protectRegister, createPurchaseOrderbc);

// ─── Lookup endpoints for purchase line/header fields ────
router.get("/items/:partnerNo", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getApprovedItemsForPartner);
router.get("/items/:partnerNo/:batchNo", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getApprovedItemDetail);
router.get("/locations", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getLocationsForPartner);

router.get("/", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getAllPurchaseOrders);
router.get("/partner/:partnerNo", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getOrdersByPartner);
router.get("/:id", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getPurchaseOrderById);
router.put("/:id", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), updatePurchaseOrder);
router.patch("/:id/status", protect, authorizeRoles("vendor_admin", "super_admin"), updateOrderStatus);
router.delete("/:id", protect, authorizeRoles("vendor_admin", "super_admin"), deletePurchaseOrder);

module.exports = router;
