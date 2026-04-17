const express = require("express");
const router = express.Router();
const { listTables, deleteAllData, deleteSelectedTables } = require("../controllers/DataManagement.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

// All routes require authentication + super_admin role
router.use(protect, isSuperAdmin);

router.get("/tables", listTables);
router.delete("/all", deleteAllData);
router.delete("/tables", deleteSelectedTables);

module.exports = router;
