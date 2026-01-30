-- Migration: Add weight to items for truck capacity calculation
-- Run this in your Supabase SQL Editor

-- Add weight_kg column to items table (weight per unit in kilograms)
ALTER TABLE items ADD COLUMN IF NOT EXISTS weight_kg NUMERIC DEFAULT 0;

-- Update existing items with approximate weights (in kg per unit)
-- These are example weights, adjust based on your actual products

-- Grains (assuming 1kg bag per unit)
UPDATE items SET weight_kg = 1 WHERE category = 'grains';

-- Oils (assuming 1L bottle per unit, ~0.9kg)
UPDATE items SET weight_kg = 0.9 WHERE category = 'oils';

-- Legumes (assuming 500g bag per unit)
UPDATE items SET weight_kg = 0.5 WHERE category = 'legumes';

-- Dairy (assuming 1L per unit, ~1kg)
UPDATE items SET weight_kg = 1 WHERE category = 'dairy';

-- Canned goods (assuming 400g can per unit)
UPDATE items SET weight_kg = 0.4 WHERE category = 'canned';

-- Dates (assuming 500g pack per unit)
UPDATE items SET weight_kg = 0.5 WHERE category = 'dates';

-- Meat (assuming 1kg per unit)
UPDATE items SET weight_kg = 1 WHERE category = 'meat';

-- Packaging (light weight)
UPDATE items SET weight_kg = 0.05 WHERE category = 'packaging';
