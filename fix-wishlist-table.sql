-- Fix Wishlist Table for UUID Users and Proper Relationships
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing table if it exists (to fix data type issues)
DROP TABLE IF EXISTS public.wishlist_items;

-- Step 2: Check what data type your users table uses for ID
-- Run this first to confirm your user ID structure:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'id';

-- Step 3: Check what data type your products table uses for ID
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'id';

-- Step 4: Create wishlist_items table with correct data types
CREATE TABLE public.wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,  -- Changed to UUID to match your user IDs
    product_id BIGINT NOT NULL,  -- Assuming products use BIGINT IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can't add the same product twice
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Step 5: Create indexes for better performance
CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);
CREATE INDEX idx_wishlist_items_created_at ON public.wishlist_items(created_at);

-- Step 6: Add foreign key constraints (if tables exist)
-- Note: Only add these if your users and products tables exist
-- Uncomment the lines below if you want foreign key constraints:

/*
ALTER TABLE public.wishlist_items 
ADD CONSTRAINT fk_wishlist_user 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.wishlist_items 
ADD CONSTRAINT fk_wishlist_product 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
*/

-- Step 7: Grant permissions
GRANT ALL ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
GRANT ALL ON public.wishlist_items TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO anon;

-- Step 8: Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'wishlist_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 9: Test insert (replace with actual user_id and product_id)
-- INSERT INTO public.wishlist_items (user_id, product_id) 
-- VALUES ('7ce2a8e2-8688-482d-912b-4df1bcdc2d2f', 88);

SELECT 'Wishlist table created successfully with UUID support!' as result;
