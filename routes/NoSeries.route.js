const { Router } = require("express");
const NoSeriesController = require("../controllers/NoSeries.Controller");
const { protect } = require("../middleware/auth.middleware");

const router = Router();

// ─── Filter routes (must come before /:id to avoid param clash) ───────────────
router.get("/code/:code", protect, NoSeriesController.getByCode);

// ─── Collection routes ─────────────────────────────────────────────────────────
router.get("/getall", protect, NoSeriesController.getAll);
router.post("/", protect, NoSeriesController.create);

// ─── Single resource routes ────────────────────────────────────────────────────
router.get("/:id", protect, NoSeriesController.getOne);
router.put("/:id", protect, NoSeriesController.update);
router.patch("/:id/next-number", protect, NoSeriesController.getNextNumber);
router.patch("/:id/reset", protect, NoSeriesController.reset);
router.delete("/:id", protect, NoSeriesController.delete);

module.exports = router;
