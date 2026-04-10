-- Create permission_groups table
CREATE TABLE IF NOT EXISTS permission_groups (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create group_permissions table
CREATE TABLE IF NOT EXISTS group_permissions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES permission_groups(id) ON DELETE CASCADE,
  screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_modify BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, screen_id)
);

-- Create user_group_assignments table
CREATE TABLE IF NOT EXISTS user_group_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES permission_groups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_group_permissions_group_screen ON group_permissions(group_id, screen_id);
CREATE INDEX IF NOT EXISTS idx_user_group_assignments_user ON user_group_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_group_assignments_group ON user_group_assignments(group_id);

-- Insert default permission groups
INSERT INTO permission_groups (group_name, description, is_active) VALUES
  ('Sales Team', 'Full access to sales-related features', true),
  ('Purchase Team', 'Full access to purchase-related features', true),
  ('Finance Team', 'Full access to financial features', true),
  ('Read Only', 'Read-only access to all features', true)
ON CONFLICT (group_name) DO NOTHING;
