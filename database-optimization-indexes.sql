-- Database Optimization: Comprehensive Indexing for Performance
-- Run this in your Supabase SQL Editor to add missing indexes

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Email lookup (login, registration checks)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Role-based queries (admin operations)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Status-based queries (user approval system)
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Email verification lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);

-- Combined index for pending approval queries
CREATE INDEX IF NOT EXISTS idx_users_pending_approval 
ON public.users(status, created_at) WHERE status = 'pending_approval';

-- ============================================================================
-- PRODUCTS TABLE INDEXES
-- ============================================================================

-- Category-based product filtering
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Price range filtering (very common in e-commerce)
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- Stock availability filtering
CREATE INDEX IF NOT EXISTS idx_products_quantity ON public.products(quantity);

-- Condition status filtering
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition_status);

-- Product search by name (partial matching)
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON public.products USING gin(to_tsvector('english', name));

-- Product search by description (full-text search)
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON public.products USING gin(to_tsvector('english', description));

-- Combined index for product listing with filters
CREATE INDEX IF NOT EXISTS idx_products_category_price ON public.products(category_id, price);

-- Combined index for in-stock products by category
CREATE INDEX IF NOT EXISTS idx_products_category_stock ON public.products(category_id, quantity) WHERE quantity > 0;

-- Recently added products
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ============================================================================
-- ORDERS TABLE INDEXES
-- ============================================================================

-- User's order history
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Order status filtering (admin operations)
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Order date range queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Combined index for user's orders by status
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);

-- Combined index for recent orders by user
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON public.orders(user_id, created_at DESC);

-- Admin dashboard queries (orders by status and date)
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON public.orders(status, created_at DESC);

-- Total amount range queries (for analytics)
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON public.orders(total_amount);

-- ============================================================================
-- ORDER_ITEMS TABLE INDEXES
-- ============================================================================

-- Order details lookup
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Product sales analytics
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Combined index for order item details
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON public.order_items(order_id, product_id);

-- ============================================================================
-- CART_ITEMS TABLE INDEXES
-- ============================================================================

-- User's cart lookup
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- Product in carts (for inventory management)
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Combined index for cart operations
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON public.cart_items(user_id, product_id);

-- Cart cleanup (old abandoned carts)
CREATE INDEX IF NOT EXISTS idx_cart_items_updated_at ON public.cart_items(updated_at);

-- ============================================================================
-- WISHLIST_ITEMS TABLE INDEXES
-- ============================================================================

-- User's wishlist lookup
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);

-- Product popularity (how many users wishlisted)
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

-- Recent wishlist additions
CREATE INDEX IF NOT EXISTS idx_wishlist_items_created_at ON public.wishlist_items(created_at DESC);

-- Combined index for wishlist operations
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_product ON public.wishlist_items(user_id, product_id);

-- ============================================================================
-- CATEGORIES TABLE INDEXES
-- ============================================================================

-- Category name lookup
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- ============================================================================
-- PERFORMANCE ANALYSIS QUERIES
-- ============================================================================

-- Use these queries to monitor index usage and performance:

-- 1. Check index usage statistics
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- 2. Find unused indexes
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' AND idx_scan = 0
-- ORDER BY tablename, indexname;

-- 3. Check table sizes and index sizes
-- SELECT 
--     schemaname,
--     tablename,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
--     pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- MAINTENANCE RECOMMENDATIONS
-- ============================================================================

-- 1. Run ANALYZE after creating indexes to update statistics
ANALYZE public.users;
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.cart_items;
ANALYZE public.wishlist_items;
ANALYZE public.categories;

-- 2. Consider running VACUUM ANALYZE periodically for optimal performance
-- VACUUM ANALYZE public.users;
-- VACUUM ANALYZE public.products;
-- VACUUM ANALYZE public.orders;

-- Success message
SELECT 'Database indexes created successfully! Run ANALYZE on your tables for optimal performance.' as status;
