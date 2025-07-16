-- Cleanup script for wishlist data
-- Run this in Supabase SQL Editor to remove invalid wishlist entries

-- Check current wishlist data
SELECT 
    w.id as wishlist_id,
    w.user_id,
    w.product_id,
    p.id as product_exists,
    p.name as product_name,
    p.status as product_status
FROM public.wishlist w
LEFT JOIN public.products p ON w.product_id = p.id
ORDER BY w.created_at DESC;

-- Remove wishlist items that reference non-existent products
DELETE FROM public.wishlist 
WHERE product_id NOT IN (
    SELECT id FROM public.products WHERE id IS NOT NULL
);

-- Remove wishlist items that reference products without names
DELETE FROM public.wishlist 
WHERE product_id IN (
    SELECT id FROM public.products 
    WHERE name IS NULL OR name = '' OR TRIM(name) = ''
);

-- Remove wishlist items that reference inactive/deleted products
DELETE FROM public.wishlist 
WHERE product_id IN (
    SELECT id FROM public.products 
    WHERE status = 'inactive' OR status = 'deleted'
);

-- Check results after cleanup
SELECT 
    w.id as wishlist_id,
    w.user_id,
    w.product_id,
    p.name as product_name,
    p.status as product_status
FROM public.wishlist w
JOIN public.products p ON w.product_id = p.id
WHERE p.name IS NOT NULL AND p.name != ''
ORDER BY w.created_at DESC;

-- Count remaining wishlist items
SELECT COUNT(*) as total_wishlist_items FROM public.wishlist;

-- Count wishlist items by user
SELECT 
    u.email,
    COUNT(w.id) as wishlist_count
FROM public.users u
LEFT JOIN public.wishlist w ON u.id = w.user_id
GROUP BY u.id, u.email
HAVING COUNT(w.id) > 0
ORDER BY wishlist_count DESC;
