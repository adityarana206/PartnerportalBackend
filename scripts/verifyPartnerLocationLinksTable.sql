-- Verify and create partner_location_links table if it doesn't exist

-- Create table if not exists
CREATE TABLE IF NOT EXISTS partner_location_links (
  id SERIAL PRIMARY KEY,
  partner_type VARCHAR(50),
  partner_no VARCHAR(100),
  description TEXT,
  address_code VARCHAR(100),
  address_name VARCHAR(255),
  location_code VARCHAR(100),
  address TEXT,
  address2 TEXT,
  city VARCHAR(100),
  post_code VARCHAR(20),
  country_region_code VARCHAR(10),
  contact VARCHAR(255),
  phone_no VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  blocked BOOLEAN DEFAULT false,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partner_location_partner_no ON partner_location_links(partner_no);
CREATE INDEX IF NOT EXISTS idx_partner_location_partner_type ON partner_location_links(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_location_location_code ON partner_location_links(location_code);
CREATE INDEX IF NOT EXISTS idx_partner_location_is_default ON partner_location_links(is_default);

-- Verify table exists
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'partner_location_links'
ORDER BY ordinal_position;
