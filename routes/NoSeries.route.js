const { Router } = require("express");
const NoSeriesController = require("../controllers/NoSeries.Controller");
const { protect } = require("../middleware/auth.middleware");
const { canRead, canWrite, canModify, canDelete } = require("../middleware/permission.middleware");

const router = Router();

// ─── Filter routes (must come before /:id to avoid param clash) ───────────────
router.get("/code/:code", protect, canRead("NO_SERIES"), NoSeriesController.getByCode);

// ─── Collection routes ─────────────────────────────────────────────────────────
router.get("/getall", protect, canRead("NO_SERIES"), NoSeriesController.getAll);
router.post("/", protect, canWrite("NO_SERIES"), NoSeriesController.create);

// ─── Single resource routes ────────────────────────────────────────────────────
router.get("/:id", protect, canRead("NO_SERIES"), NoSeriesController.getOne);
router.put("/:id", protect, canModify("NO_SERIES"), NoSeriesController.update);
router.patch("/:id/next-number", protect, canModify("NO_SERIES"), NoSeriesController.getNextNumber);
router.patch("/:id/reset", protect, canModify("NO_SERIES"), NoSeriesController.reset);
router.delete("/:id", protect, canDelete("NO_SERIES"), NoSeriesController.delete);

module.exports = router;
