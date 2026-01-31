-- Export Data Script for hassanmohamed.pss@gmail.com
-- Run this in Supabase SQL Editor to see all data for this user

-- Step 1: Find the user ID
SELECT id, email FROM auth.users WHERE email = 'hassanmohamed.pss@gmail.com';

-- Step 2: Export all items for this user
-- Copy this output to use in backfill script
SELECT 
  name_ar,
  name_en,
  unit_price,
  bulk_price,
  units_per_bulk,
  weight_kg,
  category
FROM items 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'hassanmohamed.pss@gmail.com')
ORDER BY category, name_en;

-- Step 3: Export all bag templates for this user
SELECT 
  name,
  target_count,
  total_budget
FROM bag_templates 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'hassanmohamed.pss@gmail.com')
ORDER BY created_at;

-- Step 4: Export bag items with their item names (for reference)
SELECT 
  bt.name as bag_name,
  i.name_en as item_name,
  bi.quantity
FROM bag_items bi
JOIN bag_templates bt ON bt.id = bi.bag_id
JOIN items i ON i.id = bi.item_id
WHERE bt.user_id = (SELECT id FROM auth.users WHERE email = 'hassanmohamed.pss@gmail.com')
ORDER BY bt.name, i.name_en;
