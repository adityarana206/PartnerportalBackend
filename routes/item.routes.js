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
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

// ─── READ ──────────────────────────────────────────────────
router.get("/import/template", protect, canRead("ITEM_REQUESTS"), downloadImportTemplate);
router.get("/", protect, canRead("ITEM_REQUESTS"), getAllItemRequests);
router.get("/partner/:partnerNo", protect, canRead("ITEM_REQUESTS"), getItemsByPartner);
router.get("/portal/:partnerPortalNo", protect, canRead("ITEM_REQUESTS"), getItemsByPartnerPortalNo);
router.get("/key/:partnerPortalNo/:partnerNo/:batchNo", protect, canRead("ITEM_REQUESTS"), getItemByKey);
router.get("/unit-of-measures", protect, canRead("ITEM_REQUESTS"), getUnitOfMeasures);
router.get("/:id", protect, canRead("ITEM_REQUESTS"), getItemRequestById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/import", protect, canWrite("ITEM_REQUESTS"), upload.single("file"), importItems);
router.post("/", protect, canWrite("ITEM_REQUESTS"), createItemRequest);
router.post("/businesscentral", protectRegister, createItemRequestfrombc);
router.post("/price-change", protect, canWrite("ITEM_REQUESTS"), createPriceChange);
router.post("/change-request", protect, canWrite("ITEM_REQUESTS"), createItemChangeRequest);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("ITEM_REQUESTS"), updateItemRequest);
router.patch("/:id/status", protect, canModify("ITEM_REQUESTS"), updateItemStatus);
router.patch("/:id/block", protect, canModify("ITEM_REQUESTS"), updateItemBlock);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("ITEM_REQUESTS"), deleteItemRequest);

module.exports = router;
