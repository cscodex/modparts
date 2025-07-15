-- Simple PostgreSQL migration for wishlist functionality
-- Run this in your Supabase SQL editor to create the wishlist_items table
-- This version works with JWT authentication (no RLS policies)

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist_items(created_at);

-- Insert some sample data for testing (optional)
-- INSERT INTO wishlist_items (user_id, product_id) VALUES 
-- (1, 1),
-- (1, 2),
-- (2, 1);

-- Verify the table was created
SELECT 'wishlist_items table created successfully' as status;
