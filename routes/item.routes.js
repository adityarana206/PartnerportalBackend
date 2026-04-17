const express = require("express");
const router = express.Router();
const {
  createItemRequest,
  getAllItemRequests,
  getItemRequestById,
  getItemsByPartner,
  getItemsByPartnerPortalNo,
  getItemByKey,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
  createItemRequestfrombc,
  createItemChangeRequest,
  createPriceChange,
  getUnitOfMeasures,
  importItems,
  downloadImportTemplate,
} = require("../controllers/Item.Controller");
const { protect, protectRegister } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/import/template", protect, downloadImportTemplate);
router.get("/", protect, getAllItemRequests);
router.get("/partner/:partnerNo", protect, getItemsByPartner);
router.get("/portal/:partnerPortalNo", protect, getItemsByPartnerPortalNo);
router.get("/key/:partnerPortalNo/:partnerNo/:batchNo", protect, getItemByKey);
router.get("/unit-of-measures", protect, getUnitOfMeasures);
router.get("/:id", protect, getItemRequestById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/import", protect, upload.single("file"), importItems);
router.post("/", protect, createItemRequest);
router.post("/businesscentral", protectRegister, createItemRequestfrombc);
router.post("/price-change", protect, createPriceChange);
router.post("/change-request", protect, createItemChangeRequest);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, updateItemRequest);
router.patch("/:id/status", protect, updateItemStatus);
router.patch("/:id/block", protect, updateItemBlock);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, deleteItemRequest);

module.exports = router;
