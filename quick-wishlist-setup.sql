-- Quick Wishlist Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist_items(product_id);

-- Grant permissions
GRANT ALL ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
GRANT ALL ON public.wishlist_items TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO anon;

-- Verify creation
SELECT 'Wishlist table created successfully!' as result;
