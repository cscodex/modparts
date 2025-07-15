-- Supabase SQL Script to Add Wishlist Functionality
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- Step 1: Drop existing table if it has wrong data types
DROP TABLE IF EXISTS public.wishlist_items;

-- Step 2: Create the wishlist_items table with correct data types
CREATE TABLE public.wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure a user can't add the same product twice
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_created_at ON public.wishlist_items USING btree (created_at);

-- Step 3: Add comments for documentation
COMMENT ON TABLE public.wishlist_items IS 'Stores user wishlist items';
COMMENT ON COLUMN public.wishlist_items.id IS 'Primary key';
COMMENT ON COLUMN public.wishlist_items.user_id IS 'Reference to the user who added the item';
COMMENT ON COLUMN public.wishlist_items.product_id IS 'Reference to the product in the wishlist';
COMMENT ON COLUMN public.wishlist_items.created_at IS 'When the item was added to wishlist';
COMMENT ON COLUMN public.wishlist_items.updated_at IS 'When the record was last updated';

-- Step 4: Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.wishlist_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Step 6: Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (if you want to use Supabase auth instead of JWT)
-- Uncomment these if you want to use Supabase's built-in authentication
-- Otherwise, your JWT-based API will handle access control

/*
-- Policy: Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist items" ON public.wishlist_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items" ON public.wishlist_items
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items" ON public.wishlist_items
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Policy: Users can update their own wishlist items
CREATE POLICY "Users can update own wishlist items" ON public.wishlist_items
    FOR UPDATE USING (auth.uid()::text = user_id::text);
*/

-- Step 8: Grant permissions to authenticated users and service role
GRANT ALL ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
GRANT ALL ON public.wishlist_items TO anon;

-- Step 9: Grant usage on the sequence
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.wishlist_items_id_seq TO anon;

-- Step 10: Insert some sample data for testing (optional)
-- Uncomment the lines below if you want to add test data
/*
INSERT INTO public.wishlist_items (user_id, product_id) VALUES 
(1, 1),
(1, 2),
(2, 1)
ON CONFLICT (user_id, product_id) DO NOTHING;
*/

-- Step 11: Verify the table was created successfully
SELECT 
    'SUCCESS: wishlist_items table created with ' || count(*) || ' columns' as status
FROM information_schema.columns 
WHERE table_name = 'wishlist_items' AND table_schema = 'public';

-- Step 12: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'wishlist_items' AND table_schema = 'public'
ORDER BY ordinal_position;
