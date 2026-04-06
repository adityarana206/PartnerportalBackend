-- ============================================
-- Permission Groups System
-- ============================================

-- 1. Permission Groups Table
CREATE TABLE IF NOT EXISTS permission_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Group Permissions Table (links groups to screens with permissions)
CREATE TABLE IF NOT EXISTS group_permissions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES permission_groups(id) ON DELETE CASCADE,
  screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
  can_read BOOLEAN DEFAULT FALSE,
  can_write BOOLEAN DEFAULT FALSE,
  can_modify BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, screen_id)
);

-- 3. User Group Assignments Table
CREATE TABLE IF NOT EXISTS user_group_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES permission_groups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by INTEGER REFERENCES users(id),
  UNIQUE(user_id, group_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_permissions_group ON group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_screen ON group_permissions(screen_id);
CREATE INDEX IF NOT EXISTS idx_user_group_assignments_user ON user_group_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_assignments_group ON user_group_assignments(group_id);

-- Insert default permission groups
INSERT INTO permission_groups (group_name, description) VALUES
('Admin Group', 'Full access to all modules'),
('Vendor Group', 'Access to vendor-related modules'),
('Sales Group', 'Access to sales-related modules'),
('Purchase Group', 'Access to purchase-related modules')
ON CONFLICT (group_name) DO NOTHING;
