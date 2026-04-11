const { pool } = require("../config/db");

const ADMIN_ROLES = ["super_admin", "customer_admin", "vendor_admin"];

const PermissionGroup = {
  // ─── Get all permission groups ─────────────────────────────
  async getAllGroups() {
    const result = await pool.query(
      "SELECT * FROM permission_groups ORDER BY group_name"
    );
    return result.rows;
  },

  // ─── Get group by ID ───────────────────────────────────────
  async getGroupById(groupId) {
    const result = await pool.query(
      "SELECT * FROM permission_groups WHERE id = $1",
      [groupId]
    );
    return result.rows[0];
  },

  // ─── Create permission group ───────────────────────────────
  async createGroup(groupData) {
    const query = `
      INSERT INTO permission_groups (group_name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [
      groupData.group_name,
      groupData.description,
      groupData.is_active !== undefined ? groupData.is_active : true,
    ]);
    return result.rows[0];
  },

  // ─── Update permission group ───────────────────────────────
  async updateGroup(groupId, groupData) {
    const query = `
      UPDATE permission_groups
      SET group_name = $1, description = $2, is_active = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      groupData.group_name,
      groupData.description,
      groupData.is_active,
      groupId,
    ]);
    return result.rows[0];
  },

  // ─── Delete permission group ───────────────────────────────
  async deleteGroup(groupId) {
    const result = await pool.query(
      "DELETE FROM permission_groups WHERE id = $1 RETURNING *",
      [groupId]
    );
    return result.rows[0];
  },

  // ─── Get group permissions ─────────────────────────────────
  async getGroupPermissions(groupId) {
    const query = `
      SELECT s.id, s.screen_name, s.screen_code, s.description,
             COALESCE(gp.can_read, false) as can_read,
             COALESCE(gp.can_write, false) as can_write,
             COALESCE(gp.can_modify, false) as can_modify,
             COALESCE(gp.can_delete, false) as can_delete,
             gp.id as permission_id
      FROM screens s
      LEFT JOIN group_permissions gp ON s.id = gp.screen_id AND gp.group_id = $1
      ORDER BY s.screen_name
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows;
  },

  // ─── Set group permission for a screen ────────────────────
  async setGroupPermission(groupId, screenId, permissions) {
    const query = `
      INSERT INTO group_permissions (group_id, screen_id, can_read, can_write, can_modify, can_delete)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (group_id, screen_id)
      DO UPDATE SET
        can_read = $3,
        can_write = $4,
        can_modify = $5,
        can_delete = $6,
        updated_at = NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [
      groupId,
      screenId,
      permissions.can_read,
      permissions.can_write,
      permissions.can_modify,
      permissions.can_delete,
    ]);
    return result.rows[0];
  },

  // ─── Bulk set group permissions ────────────────────────────
  async bulkSetGroupPermissions(groupId, permissionsArray) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const results = [];

      for (const perm of permissionsArray) {
        const query = `
          INSERT INTO group_permissions (group_id, screen_id, can_read, can_write, can_modify, can_delete)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (group_id, screen_id)
          DO UPDATE SET
            can_read = $3,
            can_write = $4,
            can_modify = $5,
            can_delete = $6,
            updated_at = NOW()
          RETURNING *
        `;
        const result = await client.query(query, [
          groupId,
          perm.screen_id,
          perm.can_read,
          perm.can_write,
          perm.can_modify,
          perm.can_delete,
        ]);
        results.push(result.rows[0]);
      }

      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Remove permission from group ──────────────────────────
  async removeGroupPermission(groupId, screenId) {
    const result = await pool.query(
      "DELETE FROM group_permissions WHERE group_id = $1 AND screen_id = $2 RETURNING *",
      [groupId, screenId]
    );
    return result.rows[0];
  },

  // ─── Assign group to user ──────────────────────────────────
  async assignGroupToUser(userId, groupId, assignedBy) {
    const query = `
      INSERT INTO user_group_assignments (user_id, group_id, assigned_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, group_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, groupId, assignedBy]);
    return result.rows[0];
  },

  // ─── Remove group from user ────────────────────────────────
  async removeGroupFromUser(userId, groupId) {
    const result = await pool.query(
      "DELETE FROM user_group_assignments WHERE user_id = $1 AND group_id = $2 RETURNING *",
      [userId, groupId]
    );
    return result.rows[0];
  },

  // ─── Get user's groups ─────────────────────────────────────
  async getUserGroups(userId) {
    const query = `
      SELECT pg.*, uga.assigned_at
      FROM permission_groups pg
      JOIN user_group_assignments uga ON pg.id = uga.group_id
      WHERE uga.user_id = $1 AND pg.is_active = true
      ORDER BY pg.group_name
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // ─── Get user's effective permissions from groups ──────────
  async getUserEffectivePermissions(userId) {
    const userCheck = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    // Admin roles get full access to all screens
    if (ADMIN_ROLES.includes(userCheck.rows[0]?.role)) {
      const query = `
        SELECT s.id, s.screen_name, s.screen_code, s.description,
               true as can_read,
               true as can_write,
               true as can_modify,
               true as can_delete
        FROM screens s
        ORDER BY s.screen_name
      `;
      const result = await pool.query(query);
      return result.rows;
    }
    
    // Regular users get permissions from their groups
    const query = `
      SELECT DISTINCT s.id, s.screen_name, s.screen_code, s.description,
             bool_or(gp.can_read) as can_read,
             bool_or(gp.can_write) as can_write,
             bool_or(gp.can_modify) as can_modify,
             bool_or(gp.can_delete) as can_delete
      FROM screens s
      LEFT JOIN group_permissions gp ON s.id = gp.screen_id
      LEFT JOIN user_group_assignments uga ON gp.group_id = uga.group_id
      LEFT JOIN permission_groups pg ON uga.group_id = pg.id
      WHERE uga.user_id = $1 AND pg.is_active = true
      GROUP BY s.id, s.screen_name, s.screen_code, s.description
      ORDER BY s.screen_name
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // ─── Get users in a group ──────────────────────────────────
  async getGroupUsers(groupId) {
    const query = `
      SELECT u.id, u.name, u.email, u.role, uga.assigned_at
      FROM users u
      JOIN user_group_assignments uga ON u.id = uga.user_id
      WHERE uga.group_id = $1
      ORDER BY u.name
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows;
  },
};

module.exports = PermissionGroup;
