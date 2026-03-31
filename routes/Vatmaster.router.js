const express = require("express");
const router = express.Router();
const VatMasterController = require("../controllers/Vatmaster.Controller");
const  authenticate  = require("../middleware/auth.middleware"); // adjust path as needed

// ─── VAT Master Routes ─────────────────────────────────
//
//  POST   /api/vat-masters              → Create
//  GET    /api/vat-masters              → Get All (supports ?status=&vatType= filters)
//  GET    /api/vat-masters/:id          → Get by ID
//  GET    /api/vat-masters/code/:vatCode→ Get by VAT Code
//  PUT    /api/vat-masters/:id          → Full Update
//  PATCH  /api/vat-masters/:id/status   → Status Update Only
//  DELETE /api/vat-masters/:id          → Delete
// ──────────────────────────────────────────────────────

router.post(   "/",                      authenticate.protect, VatMasterController.create);
router.get(    "/",                      authenticate.protect, VatMasterController.getAll);
router.get(    "/code/:vatCode",         authenticate.protect, VatMasterController.getByVatCode);
router.get(    "/:id",                   authenticate.protect, VatMasterController.getById);
router.put(    "/:id",                   authenticate.protect, VatMasterController.update);
router.patch(  "/:id/status",            authenticate.protect, VatMasterController.updateStatus);
router.delete( "/:id",                   authenticate.protect, VatMasterController.delete);

module.exports = router;