-- Create registration_invites table
-- Run this on your production database

-- Create table
CREATE TABLE IF NOT EXISTS registration_invites (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'vendor')),
  partner_no VARCHAR(50),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_registration_invites_token ON registration_invites(token);
CREATE INDEX IF NOT EXISTS idx_registration_invites_expires_at ON registration_invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_registration_invites_used ON registration_invites(used);

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'registration_invites'
ORDER BY ordinal_position;

-- Show count
SELECT COUNT(*) as total_invites FROM registration_invites;

COMMENT ON TABLE registration_invites IS 'Stores registration invite tokens for partner onboarding';
COMMENT ON COLUMN registration_invites.token IS 'Unique invite token sent to partners';
COMMENT ON COLUMN registration_invites.role IS 'Partner role: customer or vendor';
COMMENT ON COLUMN registration_invites.expires_at IS 'Token expiration timestamp';
COMMENT ON COLUMN registration_invites.used IS 'Whether token has been used for registration';
