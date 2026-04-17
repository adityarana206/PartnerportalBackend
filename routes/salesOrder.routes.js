const express = require("express");
const router = express.Router();
const {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  getOrdersByPartner,
  updateSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
  getApprovedItemsForPartner,
  getApprovedItemDetail,
  getLocationsForPartner,
} = require("../controllers/SalesOrder.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, getAllSalesOrders);
router.get("/locations", protect, getLocationsForPartner);
router.get("/partner/:partnerNo", protect, getOrdersByPartner);
router.get("/items/:partnerNo", protect, getApprovedItemsForPartner);
router.get("/items/:partnerNo/:batchNo", protect, getApprovedItemDetail);
router.get("/:id", protect, getSalesOrderById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, createSalesOrder);
router.post("/businesscentral", protectRegister, createSalesOrder);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updateSalesOrder);
router.patch("/:id/status", protect, updateSalesOrderStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deleteSalesOrder);

module.exports = router;
