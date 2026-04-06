const PermissionGroup = require("../models/PermissionGroup.model");

// ─── Get all permission groups ─────────────────────────────
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await PermissionGroup.getAllGroups();
    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching permission groups",
      error: error.message,
    });
  }
};

// ─── Get group by ID ───────────────────────────────────────
exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await PermissionGroup.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Permission group not found",
      });
    }
    
    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching permission group",
      error: error.message,
    });
  }
};

// ─── Create permission group ───────────────────────────────
exports.createGroup = async (req, res) => {
  try {
    const group = await PermissionGroup.createGroup(req.body);
    res.status(201).json({
      success: true,
      message: "Permission group created successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating permission group",
      error: error.message,
    });
  }
};

// ─── Update permission group ───────────────────────────────
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await PermissionGroup.updateGroup(groupId, req.body);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Permission group not found",
      });
    }
    
    res.json({
      success: true,
      message: "Permission group updated successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating permission group",
      error: error.message,
    });
  }
};

// ─── Delete permission group ───────────────────────────────
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await PermissionGroup.deleteGroup(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Permission group not found",
      });
    }
    
    res.json({
      success: true,
      message: "Permission group deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting permission group",
      error: error.message,
    });
  }
};

// ─── Get group permissions ─────────────────────────────────
exports.getGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const permissions = await PermissionGroup.getGroupPermissions(groupId);
    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group permissions",
      error: error.message,
    });
  }
};

// ─── Set group permission ──────────────────────────────────
exports.setGroupPermission = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { screen_id, can_read, can_write, can_modify, can_delete } = req.body;

    const permission = await PermissionGroup.setGroupPermission(groupId, screen_id, {
      can_read: can_read || false,
      can_write: can_write || false,
      can_modify: can_modify || false,
      can_delete: can_delete || false,
    });

    res.json({
      success: true,
      message: "Group permission updated successfully",
      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error setting group permission",
      error: error.message,
    });
  }
};

// ─── Bulk set group permissions ────────────────────────────
exports.bulkSetGroupPermissions = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions must be an array",
      });
    }

    const results = await PermissionGroup.bulkSetGroupPermissions(groupId, permissions);

    res.json({
      success: true,
      message: `Updated ${results.length} permissions for group`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error bulk setting group permissions",
      error: error.message,
    });
  }
};

// ─── Remove group permission ───────────────────────────────
exports.removeGroupPermission = async (req, res) => {
  try {
    const { groupId, screenId } = req.params;
    const removed = await PermissionGroup.removeGroupPermission(groupId, screenId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Group permission not found",
      });
    }

    res.json({
      success: true,
      message: "Group permission removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing group permission",
      error: error.message,
    });
  }
};

// ─── Assign group to user ──────────────────────────────────
exports.assignGroupToUser = async (req, res) => {
  try {
    const { userId, groupId } = req.params;
    const assignment = await PermissionGroup.assignGroupToUser(
      userId,
      groupId,
      req.user.id
    );

    res.json({
      success: true,
      message: "Group assigned to user successfully",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error assigning group to user",
      error: error.message,
    });
  }
};

// ─── Remove group from user ────────────────────────────────
exports.removeGroupFromUser = async (req, res) => {
  try {
    const { userId, groupId } = req.params;
    const removed = await PermissionGroup.removeGroupFromUser(userId, groupId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "User group assignment not found",
      });
    }

    res.json({
      success: true,
      message: "Group removed from user successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing group from user",
      error: error.message,
    });
  }
};

// ─── Get user's groups ─────────────────────────────────────
exports.getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await PermissionGroup.getUserGroups(userId);
    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user groups",
      error: error.message,
    });
  }
};

// ─── Get user's effective permissions ──────────────────────
exports.getUserEffectivePermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = await PermissionGroup.getUserEffectivePermissions(userId);
    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user effective permissions",
      error: error.message,
    });
  }
};

// ─── Get group users ───────────────────────────────────────
exports.getGroupUsers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const users = await PermissionGroup.getGroupUsers(groupId);
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group users",
      error: error.message,
    });
  }
};
