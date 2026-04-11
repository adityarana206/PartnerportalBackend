const { pool } = require("../config/db");

const ADMIN_ROLES = ["super_admin", "customer_admin", "vendor_admin"];

const Permission = {
  // ─── Get all screens ───────────────────────────────────────
  async getAllScreens() {
    const result = await pool.query(
      "SELECT * FROM screens ORDER BY screen_name"
    );
    return result.rows;
  },

  // ─── Get permissions by role ───────────────────────────────
  async getPermissionsByRole(role) {
    const query = `
      SELECT s.id, s.screen_name, s.screen_code, s.description,
             COALESCE(p.can_read, false) as can_read,
             COALESCE(p.can_write, false) as can_write,
             COALESCE(p.can_modify, false) as can_modify,
             COALESCE(p.can_delete, false) as can_delete
      FROM screens s
      LEFT JOIN permissions p ON s.id = p.screen_id AND p.role = $1
      ORDER BY s.screen_name
    `;
    const result = await pool.query(query, [role]);
    return result.rows;
  },

  // ─── Get user-specific permissions ─────────────────────────
  async getUserPermissions(userId) {
    const userCheck = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    // Admin roles get full access by default, but respect user-specific overrides
    if (ADMIN_ROLES.includes(userCheck.rows[0]?.role)) {
      const query = `
        SELECT s.id, s.screen_name, s.screen_code, s.description,
               COALESCE(up.can_read,   true) as can_read,
               COALESCE(up.can_write,  true) as can_write,
               COALESCE(up.can_modify, true) as can_modify,
               COALESCE(up.can_delete, true) as can_delete,
               (up.id IS NOT NULL) as has_override
        FROM screens s
        LEFT JOIN user_permissions up ON s.id = up.screen_id AND up.user_id = $1
        ORDER BY s.screen_name
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    }
    
    // Regular users get permissions from role, groups, and user overrides
    const query = `
      SELECT s.id, s.screen_name, s.screen_code, s.description,
             bool_or(COALESCE(up.can_read,   gp.can_read,   p.can_read,   false)) as can_read,
             bool_or(COALESCE(up.can_write,  gp.can_write,  p.can_write,  false)) as can_write,
             bool_or(COALESCE(up.can_modify, gp.can_modify, p.can_modify, false)) as can_modify,
             bool_or(COALESCE(up.can_delete, gp.can_delete, p.can_delete, false)) as can_delete,
             bool_or(up.id IS NOT NULL) as has_override
      FROM screens s
      LEFT JOIN users u ON u.id = $1
      LEFT JOIN permissions p ON s.id = p.screen_id AND p.role = u.role
      LEFT JOIN user_permissions up ON s.id = up.screen_id AND up.user_id = $1
      LEFT JOIN user_group_assignments uga ON uga.user_id = $1
      LEFT JOIN permission_groups pg ON uga.group_id = pg.id AND pg.is_active = true
      LEFT JOIN group_permissions gp ON s.id = gp.screen_id AND gp.group_id = pg.id
      GROUP BY s.id, s.screen_name, s.screen_code, s.description
      ORDER BY s.screen_name
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // ─── Check specific permission ─────────────────────────────
  // role param is optional — pass req.user.role to skip the extra DB lookup
  async checkPermission(userId, screenCode, permissionType, role) {
    try {
      // Admin roles have full access — no DB lookup needed
      if (role && ADMIN_ROLES.includes(role)) {
        return true;
      }

      // Fallback DB check when role is not supplied (e.g. direct API call)
      if (!role) {
        const userCheck = await pool.query(
          "SELECT role FROM users WHERE id = $1",
          [userId]
        );
        if (ADMIN_ROLES.includes(userCheck.rows[0]?.role)) {
          return true;
        }
      }

      const query = `
        SELECT 
          CASE $3
            WHEN 'read'   THEN bool_or(COALESCE(up.can_read,   gp.can_read,   p.can_read,   false))
            WHEN 'write'  THEN bool_or(COALESCE(up.can_write,  gp.can_write,  p.can_write,  false))
            WHEN 'modify' THEN bool_or(COALESCE(up.can_modify, gp.can_modify, p.can_modify, false))
            WHEN 'delete' THEN bool_or(COALESCE(up.can_delete, gp.can_delete, p.can_delete, false))
          END as has_permission
        FROM screens s
        LEFT JOIN users u ON u.id = $1
        LEFT JOIN permissions p ON s.id = p.screen_id AND p.role = u.role
        LEFT JOIN user_permissions up ON s.id = up.screen_id AND up.user_id = $1
        LEFT JOIN user_group_assignments uga ON uga.user_id = $1
        LEFT JOIN permission_groups pg ON uga.group_id = pg.id AND pg.is_active = true
        LEFT JOIN group_permissions gp ON s.id = gp.screen_id AND gp.group_id = pg.id
        WHERE s.screen_code = $2
        GROUP BY s.id
      `;
      const result = await pool.query(query, [userId, screenCode, permissionType]);
      return result.rows[0]?.has_permission || false;
    } catch (error) {
      console.error(`Permission check error for user ${userId}, screen ${screenCode}:`, error.message);
      // If permission check fails, deny access for non-admins
      return false;
    }
  },

  // ─── Set role permissions ──────────────────────────────────
  async setRolePermissions(role, screenId, permissions) {
    const query = `
      INSERT INTO permissions (screen_id, role, can_read, can_write, can_modify, can_delete)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (screen_id, role) 
      DO UPDATE SET 
        can_read = $3,
        can_write = $4,
        can_modify = $5,
        can_delete = $6,
        updated_at = NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [
      screenId,
      role,
      permissions.can_read,
      permissions.can_write,
      permissions.can_modify,
      permissions.can_delete,
    ]);
    return result.rows[0];
  },

  // ─── Set user-specific permissions ─────────────────────────
  async setUserPermissions(userId, screenId, permissions) {
    const query = `
      INSERT INTO user_permissions (user_id, screen_id, can_read, can_write, can_modify, can_delete)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, screen_id) 
      DO UPDATE SET 
        can_read = $3,
        can_write = $4,
        can_modify = $5,
        can_delete = $6,
        updated_at = NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      screenId,
      permissions.can_read,
      permissions.can_write,
      permissions.can_modify,
      permissions.can_delete,
    ]);
    return result.rows[0];
  },

  // ─── Remove user permission override ───────────────────────
  async removeUserPermissionOverride(userId, screenId) {
    const result = await pool.query(
      "DELETE FROM user_permissions WHERE user_id = $1 AND screen_id = $2 RETURNING *",
      [userId, screenId]
    );
    return result.rows[0];
  },

  // ─── Bulk set role permissions ─────────────────────────────
  async bulkSetRolePermissions(role, permissionsArray) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const results = [];
      
      for (const perm of permissionsArray) {
        const query = `
          INSERT INTO permissions (screen_id, role, can_read, can_write, can_modify, can_delete)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (screen_id, role) 
          DO UPDATE SET 
            can_read = $3,
            can_write = $4,
            can_modify = $5,
            can_delete = $6,
            updated_at = NOW()
          RETURNING *
        `;
        const result = await client.query(query, [
          perm.screen_id,
          role,
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

  // ─── Get screen by code ────────────────────────────────────
  async getScreenByCode(screenCode) {
    const result = await pool.query(
      "SELECT * FROM screens WHERE screen_code = $1",
      [screenCode]
    );
    return result.rows[0];
  },

  // ─── Get all database tables ───────────────────────────────
  async getAllDatabaseTables() {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.table_name);
  },

  // ─── Sync database tables with screens ─────────────────────
  async syncTablesWithScreens() {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    const tablesResult = await pool.query(query);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const synced = [];
      const skipped = [];
      
      for (const table of tables) {
        const screenCode = table.toUpperCase();
        const screenName = table.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        // Check if screen_code already exists
        const checkQuery = 'SELECT id FROM screens WHERE screen_code = $1';
        const existing = await client.query(checkQuery, [screenCode]);
        
        if (existing.rows.length > 0) {
          skipped.push({ table, reason: 'already exists' });
          continue;
        }
        
        // Try to insert with unique screen_name
        let finalScreenName = screenName;
        let attempt = 0;
        let inserted = false;
        
        while (!inserted && attempt < 10) {
          await client.query('SAVEPOINT insert_attempt');
          try {
            const insertQuery = `
              INSERT INTO screens (screen_name, screen_code, description)
              VALUES ($1, $2, $3)
              RETURNING *
            `;
            const result = await client.query(insertQuery, [
              finalScreenName,
              screenCode,
              `Table: ${table}`
            ]);

            await client.query('RELEASE SAVEPOINT insert_attempt');
            synced.push(result.rows[0]);
            inserted = true;
          } catch (err) {
            await client.query('ROLLBACK TO SAVEPOINT insert_attempt');
            if (err.code === '23505' && err.constraint === 'screens_screen_name_key') {
              attempt++;
              finalScreenName = `${screenName} (${table})`;
            } else {
              throw err;
            }
          }
        }
        
        if (!inserted) {
          skipped.push({ table, reason: 'could not generate unique name' });
        }
      }
      
      await client.query("COMMIT");
      return { synced, skipped, total: tables.length };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // ─── Get all screens with table info ───────────────────────
  async getAllScreensWithTables() {
    await this.syncTablesWithScreens();
    return await this.getAllScreens();
  },
};

module.exports = Permission;
