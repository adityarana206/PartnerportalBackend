const Permission = require("../models/Permission.model");

const ADMIN_ROLES = ["super_admin", "customer_admin", "vendor_admin"];

// ─── Check if user has specific permission ────────────────
const checkPermission = (screenCode, permissionType) => {
  return async (req, res, next) => {
    try {
      // Admin roles have full access to all resources
      if (ADMIN_ROLES.includes(req.user.role)) {
        return next();
      }

      const hasPermission = await Permission.checkPermission(
        req.user.id,
        screenCode,
        permissionType,
        req.user.role
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
      if (ADMIN_ROLES.includes(req.user.role)) {
        return next();
      }

      const checks = await Promise.all(
        permissionTypes.map((type) =>
          Permission.checkPermission(req.user.id, screenCode, type, req.user.role)
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
      if (ADMIN_ROLES.includes(req.user.role)) {
        return next();
      }

      const checks = await Promise.all(
        permissionTypes.map((type) =>
          Permission.checkPermission(req.user.id, screenCode, type, req.user.role)
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
