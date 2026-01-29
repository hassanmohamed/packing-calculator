-- Additional seed data: Chicken and Packaging Supplies
-- Run this in Supabase SQL Editor after 002_seed_items.sql

DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the first user ID (or specify your email)
    SELECT id INTO user_uuid FROM auth.users LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'No user found. Please create a user account first.';
    END IF;

    -- Insert new items: Chicken and Packaging
    INSERT INTO items (name_ar, name_en, bulk_price, units_per_bulk, unit_price, category, user_id) VALUES
    -- Meat
    ('فراخ مجمدة', 'Frozen Chicken', 200, 1, 200, 'meat', user_uuid),
    
    -- Packaging Supplies
    ('كيس صغير (١ كيلو)', 'Small Bag (1kg)', 50, 100, 0.5, 'packaging', user_uuid),
    ('شنطة كبيرة', 'Large Bag', 100, 50, 2, 'packaging', user_uuid);

    RAISE NOTICE 'Successfully inserted 3 additional items (chicken + packaging) for user %', user_uuid;
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
WHERE category IN ('meat', 'packaging')
ORDER BY category, name_en;
