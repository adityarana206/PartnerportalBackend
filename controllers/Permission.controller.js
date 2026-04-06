const Permission = require("../models/Permission.model");

// ─── Get all screens ───────────────────────────────────────
exports.getAllScreens = async (req, res) => {
  try {
    const screens = await Permission.getAllScreens();
    res.json({
      success: true,
      data: screens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching screens",
      error: error.message,
    });
  }
};

// ─── Get permissions by role ───────────────────────────────
exports.getPermissionsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const permissions = await Permission.getPermissionsByRole(role);
    res.json({
      success: true,
      role,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching role permissions",
      error: error.message,
    });
  }
};

// ─── Get current user's permissions ────────────────────────
exports.getMyPermissions = async (req, res) => {
  try {
    const permissions = await Permission.getUserPermissions(req.user.id);
    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user permissions",
      error: error.message,
    });
  }
};

// ─── Get specific user's permissions ───────────────────────
exports.getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = await Permission.getUserPermissions(userId);
    res.json({
      success: true,
      userId,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user permissions",
      error: error.message,
    });
  }
};

// ─── Set role permissions ──────────────────────────────────
exports.setRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const { screen_id, can_read, can_write, can_modify, can_delete } = req.body;

    const permission = await Permission.setRolePermissions(role, screen_id, {
      can_read: can_read || false,
      can_write: can_write || false,
      can_modify: can_modify || false,
      can_delete: can_delete || false,
    });

    res.json({
      success: true,
      message: "Role permissions updated successfully",
      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error setting role permissions",
      error: error.message,
    });
  }
};

// ─── Bulk set role permissions ─────────────────────────────
exports.bulkSetRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions must be an array",
      });
    }

    const results = await Permission.bulkSetRolePermissions(role, permissions);

    res.json({
      success: true,
      message: `Updated ${results.length} permissions for role: ${role}`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error bulk setting role permissions",
      error: error.message,
    });
  }
};

// ─── Set user-specific permissions ─────────────────────────
exports.setUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { screen_id, can_read, can_write, can_modify, can_delete } = req.body;

    const permission = await Permission.setUserPermissions(userId, screen_id, {
      can_read: can_read || false,
      can_write: can_write || false,
      can_modify: can_modify || false,
      can_delete: can_delete || false,
    });

    res.json({
      success: true,
      message: "User permissions updated successfully",
      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error setting user permissions",
      error: error.message,
    });
  }
};

// ─── Remove user permission override ───────────────────────
exports.removeUserPermissionOverride = async (req, res) => {
  try {
    const { userId, screenId } = req.params;

    const removed = await Permission.removeUserPermissionOverride(
      userId,
      screenId
    );

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "No permission override found",
      });
    }

    res.json({
      success: true,
      message: "User permission override removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing user permission override",
      error: error.message,
    });
  }
};

// ─── Check specific permission ─────────────────────────────
exports.checkPermission = async (req, res) => {
  try {
    const { screenCode, permissionType } = req.params;

    const hasPermission = await Permission.checkPermission(
      req.user.id,
      screenCode,
      permissionType
    );

    res.json({
      success: true,
      screenCode,
      permissionType,
      hasPermission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking permission",
      error: error.message,
    });
  }
};

// ─── Sync database tables ──────────────────────────────────
exports.syncDatabaseTables = async (req, res) => {
  try {
    console.log('Syncing database tables...');
    const result = await Permission.syncTablesWithScreens();
    console.log('Sync result:', result);
    res.json({
      success: true,
      message: `Synced ${result.synced.length} new tables, skipped ${result.skipped.length} existing tables out of ${result.total} total`,
      data: result,
    });
  } catch (error) {
    console.error("Error syncing database tables:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing database tables",
      error: error.message,
      stack: error.stack,
    });
  }
};
