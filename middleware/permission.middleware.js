const Permission = require("../models/Permission.model");

// ─── Check if user has specific permission ────────────────
const checkPermission = (screenCode, permissionType) => {
  return async (req, res, next) => {
    try {
      // Super admin bypasses all permission checks
      if (req.user.role === "super_admin") {
        return next();
      }

      const hasPermission = await Permission.checkPermission(
        req.user.id,
        screenCode,
        permissionType
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have ${permissionType} permission for this resource`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
        error: error.message,
      });
    }
  };
};

// ─── Shorthand permission checkers ────────────────────────
const canRead = (screenCode) => checkPermission(screenCode, "read");
const canWrite = (screenCode) => checkPermission(screenCode, "write");
const canModify = (screenCode) => checkPermission(screenCode, "modify");
const canDelete = (screenCode) => checkPermission(screenCode, "delete");

// ─── Check multiple permissions (OR logic) ─────────────────
const checkAnyPermission = (screenCode, permissionTypes) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === "super_admin") {
        return next();
      }

      const checks = await Promise.all(
        permissionTypes.map((type) =>
          Permission.checkPermission(req.user.id, screenCode, type)
        )
      );

      const hasAnyPermission = checks.some((check) => check === true);

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You need at least one of: ${permissionTypes.join(", ")} permissions`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
        error: error.message,
      });
    }
  };
};

// ─── Check multiple permissions (AND logic) ────────────────
const checkAllPermissions = (screenCode, permissionTypes) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === "super_admin") {
        return next();
      }

      const checks = await Promise.all(
        permissionTypes.map((type) =>
          Permission.checkPermission(req.user.id, screenCode, type)
        )
      );

      const hasAllPermissions = checks.every((check) => check === true);

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You need all of: ${permissionTypes.join(", ")} permissions`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
        error: error.message,
      });
    }
  };
};

module.exports = {
  checkPermission,
  canRead,
  canWrite,
  canModify,
  canDelete,
  checkAnyPermission,
  checkAllPermissions,
};
