-- Backfill Data Script for New Users
-- This script copies items and bag templates from the source user to a target user
-- 
-- INSTRUCTIONS:
-- 1. First run export_user_data.sql to verify the source data
-- 2. Replace 'TARGET_USER_EMAIL' with the email of the new user you want to seed
-- 3. Run this script in Supabase SQL Editor

-- =====================================================
-- CONFIGURATION - Change this to the target user's email
-- =====================================================
DO $$
DECLARE
  source_user_id UUID;
  target_user_id UUID;
  source_email TEXT := 'hassanmohamed.pss@gmail.com';
  target_email TEXT := 'TARGET_USER_EMAIL'; -- <-- CHANGE THIS
  new_bag_id UUID;
  source_bag RECORD;
  source_bag_item RECORD;
  new_item_id UUID;
BEGIN
  -- Get source user ID
  SELECT id INTO source_user_id FROM auth.users WHERE email = source_email;
  IF source_user_id IS NULL THEN
    RAISE EXCEPTION 'Source user not found: %', source_email;
  END IF;
  
  -- Get target user ID
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user not found: %', target_email;
  END IF;
  
  RAISE NOTICE 'Copying data from % to %', source_email, target_email;
  
  -- =====================================================
  -- Step 1: Copy all items
  -- =====================================================
  INSERT INTO items (name_ar, name_en, unit_price, bulk_price, units_per_bulk, weight_kg, category, user_id)
  SELECT 
    name_ar,
    name_en,
    unit_price,
    bulk_price,
    units_per_bulk,
    weight_kg,
    category,
    target_user_id
  FROM items 
  WHERE user_id = source_user_id
  ON CONFLICT DO NOTHING; -- Skip if items already exist
  
  RAISE NOTICE 'Items copied successfully';
  
  -- =====================================================
  -- Step 2: Copy bag templates and their items
  -- =====================================================
  FOR source_bag IN 
    SELECT * FROM bag_templates WHERE user_id = source_user_id
  LOOP
    -- Create a new bag template for target user
    INSERT INTO bag_templates (name, target_count, total_budget, user_id)
    VALUES (source_bag.name, source_bag.target_count, source_bag.total_budget, target_user_id)
    RETURNING id INTO new_bag_id;
    
    -- Copy bag items, matching by item name
    FOR source_bag_item IN
      SELECT bi.quantity, i.name_en
      FROM bag_items bi
      JOIN items i ON i.id = bi.item_id
      WHERE bi.bag_id = source_bag.id
    LOOP
      -- Find the matching item in target user's items
      SELECT id INTO new_item_id 
      FROM items 
      WHERE user_id = target_user_id 
        AND name_en = source_bag_item.name_en
      LIMIT 1;
      
      IF new_item_id IS NOT NULL THEN
        INSERT INTO bag_items (bag_id, item_id, quantity)
        VALUES (new_bag_id, new_item_id, source_bag_item.quantity)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Bag template copied: %', source_bag.name;
  END LOOP;
  
  RAISE NOTICE 'All data copied successfully!';
END $$;

-- =====================================================
-- Verify the copy was successful
-- =====================================================
-- SELECT COUNT(*) as items_count FROM items WHERE user_id = (SELECT id FROM auth.users WHERE email = 'TARGET_USER_EMAIL');
-- SELECT COUNT(*) as bags_count FROM bag_templates WHERE user_id = (SELECT id FROM auth.users WHERE email = 'TARGET_USER_EMAIL');
