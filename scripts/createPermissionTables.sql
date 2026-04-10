-- Create screens table
CREATE TABLE IF NOT EXISTS screens (
  id SERIAL PRIMARY KEY,
  screen_name VARCHAR(255) UNIQUE NOT NULL,
  screen_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create permissions table (role-based)
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_modify BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(screen_id, role)
);

-- Create user_permissions table (user-specific overrides)
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_modify BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, screen_id)
);

-- Insert default screens
INSERT INTO screens (screen_name, screen_code, description) VALUES
  ('Sales Orders', 'SALES_ORDERS', 'Manage sales orders'),
  ('Purchase Orders', 'PURCHASE_ORDERS', 'Manage purchase orders'),
  ('Invoices', 'INVOICES', 'Manage invoices'),
  ('Purchase Invoices', 'PURCHASE_INVOICES', 'Manage purchase invoices'),
  ('Items', 'ITEMS', 'Manage items'),
  ('Contacts', 'CONTACTS', 'Manage contacts'),
  ('Users', 'USERS', 'Manage users'),
  ('Payments', 'PAYMENTS', 'Manage payments'),
  ('Purchase Receipts', 'PURCHASE_RECEIPTS', 'Manage purchase receipts'),
  ('Sales Shipments', 'SALES_SHIPMENTS', 'Manage sales shipments'),
  ('VAT Master', 'VAT_MASTER', 'Manage VAT settings'),
  ('Unit of Measure', 'UNIT_OF_MEASURE', 'Manage units of measure'),
  ('Item Categories', 'ITEM_CATEGORIES', 'Manage item categories'),
  ('Purchase Prices', 'PURCHASE_PRICES', 'Manage purchase prices'),
  ('Partner Location Links', 'PARTNER_LOCATION_LINKS', 'Manage partner location links'),
  ('No Series', 'NO_SERIES', 'Manage number series'),
  ('Permissions', 'PERMISSIONS', 'Manage permissions'),
  ('Permission Groups', 'PERMISSION_GROUPS', 'Manage permission groups')
ON CONFLICT (screen_code) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permissions_screen_role ON permissions(screen_id, role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_screen ON user_permissions(user_id, screen_id);
