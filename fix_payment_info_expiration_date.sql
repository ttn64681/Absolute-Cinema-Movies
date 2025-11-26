-- Fix expiration_date column type in payment_info table
-- Run this SQL manually in your database if you get the casting error

-- Option 1: If the column is VARCHAR/TEXT, convert it:
-- ALTER TABLE payment_info 
--   ALTER COLUMN expiration_date TYPE date USING expiration_date::date;

-- Option 2: If the column is TIMESTAMP, convert it:
-- ALTER TABLE payment_info 
--   ALTER COLUMN expiration_date TYPE date USING expiration_date::date;

-- Option 3: If you're not sure, check the current type first:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'payment_info' AND column_name = 'expiration_date';
