-- Run this in Supabase SQL Editor
ALTER TABLE purchase_order_lines 
ADD COLUMN IF NOT EXISTS inv_discount_amount NUMERIC(15,4) DEFAULT 0;

-- Verify column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'purchase_order_lines' 
AND column_name = 'inv_discount_amount';
