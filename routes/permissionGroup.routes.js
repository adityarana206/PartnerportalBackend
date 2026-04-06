const express = require("express");
const router = express.Router();
const {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupPermissions,
  setGroupPermission,
  bulkSetGroupPermissions,
  removeGroupPermission,
  assignGroupToUser,
  removeGroupFromUser,
  getUserGroups,
  getUserEffectivePermissions,
  getGroupUsers,
} = require("../controllers/PermissionGroup.controller");
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");

// ─── Permission Group Management (Admin Only) ──────────────
router.get("/groups", protect, isSuperAdmin, getAllGroups);
router.post("/groups", protect, isSuperAdmin, createGroup);
router.get("/groups/:groupId", protect, isSuperAdmin, getGroupById);
router.put("/groups/:groupId", protect, isSuperAdmin, updateGroup);
router.delete("/groups/:groupId", protect, isSuperAdmin, deleteGroup);

// ─── Group Permissions Management (Admin Only) ─────────────
router.get("/groups/:groupId/permissions", protect, isSuperAdmin, getGroupPermissions);
router.post("/groups/:groupId/permissions", protect, isSuperAdmin, setGroupPermission);
router.post("/groups/:groupId/permissions/bulk", protect, isSuperAdmin, bulkSetGroupPermissions);
router.delete("/groups/:groupId/permissions/:screenId", protect, isSuperAdmin, removeGroupPermission);

// ─── User Group Assignments (Admin Only) ───────────────────
router.post("/users/:userId/groups/:groupId", protect, isSuperAdmin, assignGroupToUser);
router.delete("/users/:userId/groups/:groupId", protect, isSuperAdmin, removeGroupFromUser);
router.get("/users/:userId/groups", protect, isSuperAdmin, getUserGroups);
router.get("/users/:userId/effective-permissions", protect, getUserEffectivePermissions);

// ─── Group Users (Admin Only) ──────────────────────────────
router.get("/groups/:groupId/users", protect, isSuperAdmin, getGroupUsers);

module.exports = router;
