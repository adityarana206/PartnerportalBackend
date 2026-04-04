const express = require("express");
const router = express.Router();
const {
  createItemRequest,
  getAllItemRequests,
  getItemRequestById,
  getItemsByPartner,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
  createItemRequestfrombc,
  createItemChangeRequest,
  createPriceChange,
  getUnitOfMeasures,
} = require("../controllers/Item.Controller");
const {
  protect,
  authorizeRoles,
  isSuperAdmin,
  isVendorSide,
  protectRegister,
} = require("../middleware/auth.middleware");

// ─── Vendor + Vendor Admin + Super Admin ──────────────────
router.post(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  createItemRequest,
);

router.post("/businesscentral", protectRegister, createItemRequestfrombc);
router.post("/price-change", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), createPriceChange);
router.post("/change-request", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), createItemChangeRequest);
router.get("/unit-of-measures", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getUnitOfMeasures);
router.get(
  "/",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getAllItemRequests,
);
router.get(
  "/partner/:partnerNo",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getItemsByPartner,
);
router.get(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  getItemRequestById,
);
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  updateItemRequest,
);

// ─── Vendor Admin + Super Admin Only ─────────────────────
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  updateItemStatus,
);
router.patch(
  "/:id/block",
  protect,
  authorizeRoles("vendor", "vendor_admin", "super_admin"),
  updateItemBlock,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  deleteItemRequest,
);

module.exports = router;
