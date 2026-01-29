-- Seed data for Ramadan Bag Items
-- Run this in Supabase SQL Editor after creating a user account
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users table

-- First, get your user ID by running:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then replace the placeholder below and run the INSERT statements

DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the first user ID (or specify your email)
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'No user found. Please create a user account first.';
    END IF;

    -- Insert items with Arabic and English names
    INSERT INTO items (name_ar, name_en, bulk_price, units_per_bulk, unit_price, category, user_id) VALUES
    -- Grains
    ('رز', 'Rice', 175, 25, 7, 'grains', user_uuid),
    ('مكرونة', 'Pasta', 80, 10, 8, 'grains', user_uuid),
    ('عدس', 'Lentils', 160, 10, 16, 'grains', user_uuid),
    ('سكر', 'Sugar', 85, 10, 8.5, 'grains', user_uuid),
    
    -- Legumes
    ('لوبيا', 'Black-eyed Peas', 550, 25, 22, 'dryGoods', user_uuid),
    ('فول', 'Fava Beans', 550, 25, 22, 'dryGoods', user_uuid),
    
    -- Oils & Fats
    ('زيت كرتونة', 'Cooking Oil (Carton)', 204, 12, 17, 'liquids', user_uuid),
    ('سمنة', 'Ghee', 240, 12, 20, 'liquids', user_uuid),
    
    -- Canned & Sauces
    ('صلصة', 'Tomato Sauce', 96, 12, 8, 'canned', user_uuid),
    
    -- Spices & Seasonings
    ('ملح', 'Salt', 17.5, 20, 0.875, 'spices', user_uuid),
    ('شاي', 'Tea', 78, 24, 3.25, 'spices', user_uuid),
    
    -- Other
    ('بلح', 'Dates', 25, 1, 25, 'other', user_uuid);

    RAISE NOTICE 'Successfully inserted 12 items for user %', user_uuid;
END $$;

-- Verify the inserted items
SELECT 
    name_ar,
    name_en, 
    bulk_price,
    units_per_bulk,
    unit_price,
    category
FROM items 
ORDER BY category, name_en;
