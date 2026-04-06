const express = require("express");
const router = express.Router();
const {
  getAllScreens,
  getPermissionsByRole,
  getMyPermissions,
  getUserPermissions,
  setRolePermissions,
  bulkSetRolePermissions,
  setUserPermissions,
  removeUserPermissionOverride,
  checkPermission,
  syncDatabaseTables,
} = require("../controllers/Permission.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

// ─── Public/Protected Routes ───────────────────────────────
router.get("/screens", protect, getAllScreens);
router.get("/me", protect, getMyPermissions);
router.get("/check/:screenCode/:permissionType", protect, checkPermission);

// ─── Super Admin Only Routes ───────────────────────────────
router.post("/sync-tables", protect, isSuperAdmin, syncDatabaseTables);
router.get("/role/:role", protect, isSuperAdmin, getPermissionsByRole);
router.post("/role/:role", protect, isSuperAdmin, setRolePermissions);
router.post("/role/:role/bulk", protect, isSuperAdmin, bulkSetRolePermissions);

router.get("/user/:userId", protect, isSuperAdmin, getUserPermissions);
router.post("/user/:userId", protect, isSuperAdmin, setUserPermissions);
router.delete(
  "/user/:userId/screen/:screenId",
  protect,
  isSuperAdmin,
  removeUserPermissionOverride
);

module.exports = router;
