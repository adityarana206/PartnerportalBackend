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

router.get("/", protect, getAllPurchasePrices);
router.get("/:id", protect, getPurchasePriceById);
router.post("/", protect, createPurchasePrice);
router.put("/:id", protect, updatePurchasePrice);
router.delete("/:id", protect, deletePurchasePrice);

module.exports = router;
