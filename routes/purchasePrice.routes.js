const express = require("express");
const router = express.Router();
const {
  getAllPurchasePrices,
  getPurchasePriceById,
  createPurchasePrice,
  updatePurchasePrice,
  deletePurchasePrice,
} = require("../controllers/PurchasePrice.controller");
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

router.get("/", protect, canRead("PURCHASE_PRICES"), getAllPurchasePrices);
router.get("/:id", protect, canRead("PURCHASE_PRICES"), getPurchasePriceById);
router.post("/", protect, canWrite("PURCHASE_PRICES"), createPurchasePrice);
router.put("/:id", protect, canModify("PURCHASE_PRICES"), updatePurchasePrice);
router.delete("/:id", protect, canDelete("PURCHASE_PRICES"), deletePurchasePrice);

module.exports = router;
