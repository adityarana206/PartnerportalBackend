const express = require("express");
const router = express.Router();
const VatMasterController = require("../controllers/Vatmaster.Controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, VatMasterController.getAll);
router.get("/code/:vatCode", protect, VatMasterController.getByVatCode);
router.get("/:id", protect, VatMasterController.getById);
router.post("/", protect, VatMasterController.create);
router.put("/:id", protect, VatMasterController.update);
router.patch("/:id/status", protect, VatMasterController.updateStatus);
router.delete("/:id", protect, VatMasterController.delete);

module.exports = router;
