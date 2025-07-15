-- Supabase PostgreSQL migration for wishlist functionality
-- Run this in your Supabase SQL editor to create the wishlist_items table

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Add foreign key constraints (if the referenced tables exist)
-- Note: Uncomment these if you have users and products tables with integer IDs
-- ALTER TABLE wishlist_items 
-- ADD CONSTRAINT fk_wishlist_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE wishlist_items 
-- ADD CONSTRAINT fk_wishlist_product 
-- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist_items(created_at);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON wishlist_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can only insert their own wishlist items
CREATE POLICY "Users can insert their own wishlist items" ON wishlist_items
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can only delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist items" ON wishlist_items
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Grant necessary permissions
GRANT ALL ON wishlist_items TO authenticated;
GRANT ALL ON wishlist_items TO service_role;
