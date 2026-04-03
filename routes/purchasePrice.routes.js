const express = require("express");
const router = express.Router();
const {
  getAllPurchasePrices,
  getPurchasePriceById,
  createPurchasePrice,
  updatePurchasePrice,
  deletePurchasePrice,
} = require("../controllers/PurchasePrice.controller");
const { protect, authorizeRoles } = require("../middleware/auth.middleware");

router.get("/", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getAllPurchasePrices);
router.get("/:id", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), getPurchasePriceById);
router.post("/", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), createPurchasePrice);
router.put("/:id", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), updatePurchasePrice);
router.delete("/:id", protect, authorizeRoles("vendor", "vendor_admin", "super_admin"), deletePurchasePrice);

module.exports = router;
