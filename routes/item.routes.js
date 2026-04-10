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
router.get("/import/template", protect, canRead("ITEMS"), downloadImportTemplate);
router.get("/", protect, canRead("ITEMS"), getAllItemRequests);
router.get("/partner/:partnerNo", protect, canRead("ITEMS"), getItemsByPartner);
router.get("/portal/:partnerPortalNo", protect, canRead("ITEMS"), getItemsByPartnerPortalNo);
router.get("/key/:partnerPortalNo/:partnerNo/:batchNo", protect, canRead("ITEMS"), getItemByKey);
router.get("/unit-of-measures", protect, canRead("ITEMS"), getUnitOfMeasures);
router.get("/:id", protect, canRead("ITEMS"), getItemRequestById);

// ─── WRITE (Create) ────────────────────────────────────────
router.post("/import", protect, canWrite("ITEMS"), upload.single("file"), importItems);
router.post("/", protect, canWrite("ITEMS"), createItemRequest);
router.post("/businesscentral", protectRegister, createItemRequestfrombc);
router.post("/price-change", protect, canWrite("ITEMS"), createPriceChange);
router.post("/change-request", protect, canWrite("ITEMS"), createItemChangeRequest);

// ─── MODIFY (Update) ───────────────────────────────────────
router.put("/:id", protect, canModify("ITEMS"), updateItemRequest);
router.patch("/:id/status", protect, canModify("ITEMS"), updateItemStatus);
router.patch("/:id/block", protect, canModify("ITEMS"), updateItemBlock);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", protect, canDelete("ITEMS"), deleteItemRequest);

module.exports = router;
