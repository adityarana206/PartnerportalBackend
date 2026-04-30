const express = require("express");
const router = express.Router();
const {
  createDeliveryOrder,
  getAllDeliveryOrders,
  getDeliveryOrderById,
  getDeliveryOrdersByPartner,
  updateDeliveryOrder,
  updateDeliveryOrderStatus,
  reprocessDeliveryOrder,
  deleteDeliveryOrder,
} = require("../controllers/DeliveryOrder.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/",                      protect, getAllDeliveryOrders);
router.get("/partner/:partnerNo",    protect, getDeliveryOrdersByPartner);
router.get("/:id",                   protect, getDeliveryOrderById);
router.post("/",                     protect, createDeliveryOrder);
router.post("/:id/reprocess",        protect, reprocessDeliveryOrder);
router.put("/:id",                   protect, updateDeliveryOrder);
router.patch("/:id/status",          protect, updateDeliveryOrderStatus);
router.delete("/:id",                protect, deleteDeliveryOrder);

module.exports = router;
