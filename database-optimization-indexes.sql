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

-- ============================================================================
-- EMAIL SYSTEM SETUP
-- ============================================================================

-- Create email logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'order_shipped', etc.
    recipient_email VARCHAR(255) NOT NULL,
    email_id VARCHAR(255), -- External email service ID (Resend, SendGrid, etc.)
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON public.email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

-- Enable RLS for email logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for email logs (admin only)
CREATE POLICY "Admin can view email logs" ON public.email_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Function to automatically send order confirmation email
CREATE OR REPLACE FUNCTION send_order_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Only send email for new orders (not updates)
    IF TG_OP = 'INSERT' THEN
        -- Call the Edge Function to send email
        PERFORM
            net.http_post(
                url := current_setting('app.supabase_url') || '/functions/v1/send-order-email',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
                ),
                body := jsonb_build_object(
                    'type', 'order_confirmation',
                    'data', jsonb_build_object(
                        'orderId', NEW.id::text,
                        'userEmail', (SELECT email FROM public.users WHERE id = NEW.user_id),
                        'userName', (SELECT first_name || ' ' || last_name FROM public.users WHERE id = NEW.user_id),
                        'orderTotal', NEW.total_amount,
                        'orderStatus', NEW.status,
                        'shippingAddress', jsonb_build_object(
                            'address', NEW.shipping_address,
                            'city', NEW.shipping_city,
                            'state', NEW.shipping_state,
                            'zipCode', NEW.shipping_zip_code
                        )
                    )
                )
            );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send order status update emails
CREATE OR REPLACE FUNCTION send_order_status_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Only send email if status actually changed
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- Determine email type based on new status
        PERFORM
            net.http_post(
                url := current_setting('app.supabase_url') || '/functions/v1/send-order-email',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
                ),
                body := jsonb_build_object(
                    'type', CASE
                        WHEN NEW.status = 'shipped' THEN 'order_shipped'
                        WHEN NEW.status = 'delivered' THEN 'order_delivered'
                        WHEN NEW.status = 'cancelled' THEN 'order_cancelled'
                        ELSE 'order_status_update'
                    END,
                    'data', jsonb_build_object(
                        'orderId', NEW.id::text,
                        'userEmail', (SELECT email FROM public.users WHERE id = NEW.user_id),
                        'userName', (SELECT first_name || ' ' || last_name FROM public.users WHERE id = NEW.user_id),
                        'orderTotal', NEW.total_amount,
                        'orderStatus', NEW.status,
                        'shippingAddress', jsonb_build_object(
                            'address', NEW.shipping_address,
                            'city', NEW.shipping_city,
                            'state', NEW.shipping_state,
                            'zipCode', NEW.shipping_zip_code
                        )
                    )
                )
            );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic email sending
DROP TRIGGER IF EXISTS trigger_send_order_confirmation ON public.orders;
CREATE TRIGGER trigger_send_order_confirmation
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION send_order_confirmation_email();

DROP TRIGGER IF EXISTS trigger_send_order_status_update ON public.orders;
CREATE TRIGGER trigger_send_order_status_update
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION send_order_status_email();

-- Success message
SELECT 'Database indexes and email system created successfully!
Configure your Edge Function environment variables:
- RESEND_API_KEY
- FROM_EMAIL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY' as status;
