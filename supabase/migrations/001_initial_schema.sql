-- Ramadan Bag Planner Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items table (The Ingredients / Inventory)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  bulk_price NUMERIC NOT NULL DEFAULT 0,
  units_per_bulk NUMERIC NOT NULL DEFAULT 1,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Bag Templates table (Saved Bag Configurations)
CREATE TABLE IF NOT EXISTS bag_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target_count INTEGER DEFAULT 0,
  total_budget NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Bag Items junction table
CREATE TABLE IF NOT EXISTS bag_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bag_id UUID REFERENCES bag_templates(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  UNIQUE(bag_id, item_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_bag_templates_user_id ON bag_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_bag_items_bag_id ON bag_items(bag_id);
CREATE INDEX IF NOT EXISTS idx_bag_items_item_id ON bag_items(item_id);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bag_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bag_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items table
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bag_templates table
CREATE POLICY "Users can view their own bag templates" ON bag_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bag templates" ON bag_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bag templates" ON bag_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bag templates" ON bag_templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bag_items table
CREATE POLICY "Users can view bag items for their bags" ON bag_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bag_templates 
      WHERE bag_templates.id = bag_items.bag_id 
      AND bag_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert bag items for their bags" ON bag_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bag_templates 
      WHERE bag_templates.id = bag_items.bag_id 
      AND bag_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update bag items for their bags" ON bag_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM bag_templates 
      WHERE bag_templates.id = bag_items.bag_id 
      AND bag_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bag items for their bags" ON bag_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM bag_templates 
      WHERE bag_templates.id = bag_items.bag_id 
      AND bag_templates.user_id = auth.uid()
    )
  );
