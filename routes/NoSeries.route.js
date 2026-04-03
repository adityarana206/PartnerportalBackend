const { Router } = require("express");
const NoSeriesController = require("../controllers/NoSeries.Controller");

const router = Router();

// ─── Filter routes (must come before /:id to avoid param clash) ───────────────
router.get("/code/:code",        NoSeriesController.getByCode);      // GET    /api/no-series/code/:code

// ─── Collection routes ────────────────────────────────────────────────────────
router.get("/getall",                  NoSeriesController.getAll);          // GET    /api/no-series
router.post("/",                 NoSeriesController.create);          // POST   /api/no-series

// ─── Single resource routes ───────────────────────────────────────────────────
router.get("/:id",               NoSeriesController.getOne);          // GET    /api/no-series/:id
router.put("/:id",               NoSeriesController.update);          // PUT    /api/no-series/:id
router.patch("/:id/next-number", NoSeriesController.getNextNumber);   // PATCH  /api/no-series/:id/next-number
router.patch("/:id/reset",       NoSeriesController.reset);           // PATCH  /api/no-series/:id/reset
router.delete("/:id",            NoSeriesController.delete);          // DELETE /api/no-series/:id

module.exports = router;