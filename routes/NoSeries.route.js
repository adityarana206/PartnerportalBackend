const { Router } = require("express");
const NoSeriesController = require("../controllers/NoSeries.Controller");

const router = Router();

router.get("/code/:code",        NoSeriesController.getByCode);      // GET    /api/no-series/code/:code

router.get("/getall",                  NoSeriesController.getAll);          // GET    /api/no-series
router.post("/create",                 NoSeriesController.create);          // POST   /api/no-series

router.get("/:id",               NoSeriesController.getOne);          // GET    /api/no-series/:id
router.put("/:id",               NoSeriesController.update);          // PUT    /api/no-series/:id
router.patch("/:id/next-number", NoSeriesController.getNextNumber);   // PATCH  /api/no-series/:id/next-number
router.patch("/:id/reset",       NoSeriesController.reset);           // PATCH  /api/no-series/:id/reset
router.delete("/:id",            NoSeriesController.delete);         

module.exports = router;