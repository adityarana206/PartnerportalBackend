const express = require("express");
const router = express.Router();
const VatMasterController = require("../controllers/Vatmaster.Controller");
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

router.get("/", protect, canRead("VAT_MASTERS"), VatMasterController.getAll);
router.get("/code/:vatCode", protect, canRead("VAT_MASTERS"), VatMasterController.getByVatCode);
router.get("/:id", protect, canRead("VAT_MASTERS"), VatMasterController.getById);
router.post("/", protect, canWrite("VAT_MASTERS"), VatMasterController.create);
router.put("/:id", protect, canModify("VAT_MASTERS"), VatMasterController.update);
router.patch("/:id/status", protect, canModify("VAT_MASTERS"), VatMasterController.updateStatus);
router.delete("/:id", protect, canDelete("VAT_MASTERS"), VatMasterController.delete);

module.exports = router;
