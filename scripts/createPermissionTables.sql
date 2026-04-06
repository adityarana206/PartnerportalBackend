-- ============================================
-- Permission System Tables
-- ============================================

-- 1. Screens/Modules Table
CREATE TABLE IF NOT EXISTS screens (
  id SERIAL PRIMARY KEY,
  screen_name VARCHAR(100) UNIQUE NOT NULL,
  screen_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  can_read BOOLEAN DEFAULT FALSE,
  can_write BOOLEAN DEFAULT FALSE,
  can_modify BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(screen_id, role)
);

-- 3. User Permissions Override (Optional - for specific user overrides)
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
  can_read BOOLEAN DEFAULT FALSE,
  can_write BOOLEAN DEFAULT FALSE,
  can_modify BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, screen_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role);
CREATE INDEX IF NOT EXISTS idx_permissions_screen ON permissions(screen_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_screen ON user_permissions(screen_id);

-- Insert default screens
INSERT INTO screens (screen_name, screen_code, description) VALUES
('Users Management', 'USERS', 'Manage users and their profiles'),
('Items Management', 'ITEMS', 'Manage vendor items and requests'),
('Contacts Management', 'CONTACTS', 'Manage customer and vendor contacts'),
('Purchase Orders', 'PURCHASE_ORDERS', 'Manage purchase orders'),
('Sales Orders', 'SALES_ORDERS', 'Manage sales orders'),
('Invoices', 'INVOICES', 'Manage sales invoices'),
('Purchase Invoices', 'PURCHASE_INVOICES', 'Manage purchase invoices'),
('Purchase Receipts', 'PURCHASE_RECEIPTS', 'Manage purchase receipts'),
('Purchase Prices', 'PURCHASE_PRICES', 'Manage purchase pricing'),
('Item Categories', 'ITEM_CATEGORIES', 'Manage item categories'),
('Payments', 'PAYMENTS', 'Manage payments'),
('Unit of Measures', 'UNIT_OF_MEASURES', 'Manage units of measurement'),
('Partner Location Links', 'PARTNER_LOCATIONS', 'Manage partner locations'),
('No Series', 'NO_SERIES', 'Manage number series'),
('VAT Master', 'VAT_MASTER', 'Manage VAT configurations')
ON CONFLICT (screen_code) DO NOTHING;
