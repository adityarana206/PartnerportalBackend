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
} = require("../controllers/SalesOrder.controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/", protect, canRead("SALES_ORDERS"), getAllSalesOrders);
router.get("/partner/:partnerNo", protect, canRead("SALES_ORDERS"), getOrdersByPartner);
router.get("/:id", protect, canRead("SALES_ORDERS"), getSalesOrderById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/", protect, canWrite("SALES_ORDERS"), createSalesOrder);
router.post("/businesscentral", protectRegister, createSalesOrder);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("SALES_ORDERS"), updateSalesOrder);
router.patch("/:id/status", protect, canModify("SALES_ORDERS"), updateSalesOrderStatus);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("SALES_ORDERS"), deleteSalesOrder);

module.exports = router;
