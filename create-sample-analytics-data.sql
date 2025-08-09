-- Sample Data for Financial Analytics Testing
-- Run this in your Supabase SQL Editor to create test data

-- Note: This script assumes you have existing users and products
-- Modify the user_id and product_id values to match your actual data

-- First, let's check what users and products exist
-- SELECT id, email FROM users WHERE role = 'customer' LIMIT 5;
-- SELECT id, name, price FROM products LIMIT 10;

-- Sample Orders (replace user_id with actual user IDs from your database)
INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, created_at) VALUES
-- Recent orders (last 30 days)
(1, 299.99, 'delivered', '123 Main St, City, State 12345', 'stripe', NOW() - INTERVAL '5 days'),
(2, 149.50, 'delivered', '456 Oak Ave, City, State 12345', 'paypal', NOW() - INTERVAL '10 days'),
(1, 89.99, 'shipped', '123 Main St, City, State 12345', 'stripe', NOW() - INTERVAL '15 days'),
(3, 199.99, 'processing', '789 Pine St, City, State 12345', 'stripe', NOW() - INTERVAL '20 days'),
(2, 349.99, 'delivered', '456 Oak Ave, City, State 12345', 'paypal', NOW() - INTERVAL '25 days'),

-- Older orders (30-90 days ago)
(1, 129.99, 'delivered', '123 Main St, City, State 12345', 'stripe', NOW() - INTERVAL '35 days'),
(3, 79.99, 'delivered', '789 Pine St, City, State 12345', 'stripe', NOW() - INTERVAL '45 days'),
(2, 249.99, 'delivered', '456 Oak Ave, City, State 12345', 'paypal', NOW() - INTERVAL '55 days'),
(1, 189.99, 'delivered', '123 Main St, City, State 12345', 'stripe', NOW() - INTERVAL '65 days'),
(3, 99.99, 'delivered', '789 Pine St, City, State 12345', 'stripe', NOW() - INTERVAL '75 days'),

-- Even older orders (90+ days ago)
(2, 159.99, 'delivered', '456 Oak Ave, City, State 12345', 'paypal', NOW() - INTERVAL '95 days'),
(1, 219.99, 'delivered', '123 Main St, City, State 12345', 'stripe', NOW() - INTERVAL '105 days'),
(3, 179.99, 'delivered', '789 Pine St, City, State 12345', 'stripe', NOW() - INTERVAL '115 days');

-- Get the order IDs that were just created (you may need to adjust these based on your actual order IDs)
-- You can run this query to see the order IDs: SELECT id FROM orders ORDER BY created_at DESC LIMIT 13;

-- Sample Order Items (replace order_id and product_id with actual IDs)
-- Assuming order IDs start from a certain number, adjust as needed
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- For recent orders
(1, 1, 2, 149.99),  -- Order 1: 2x Product 1 at $149.99 each
(1, 3, 1, 299.99),  -- Order 1: 1x Product 3 at $299.99

(2, 2, 1, 149.50),  -- Order 2: 1x Product 2 at $149.50

(3, 4, 1, 89.99),   -- Order 3: 1x Product 4 at $89.99

(4, 1, 1, 199.99),  -- Order 4: 1x Product 1 at $199.99

(5, 5, 2, 174.99),  -- Order 5: 2x Product 5 at $174.99 each

-- For older orders
(6, 2, 1, 129.99),  -- Order 6: 1x Product 2 at $129.99
(7, 3, 1, 79.99),   -- Order 7: 1x Product 3 at $79.99
(8, 1, 1, 249.99),  -- Order 8: 1x Product 1 at $249.99
(9, 4, 2, 94.99),   -- Order 9: 2x Product 4 at $94.99 each
(10, 5, 1, 99.99),  -- Order 10: 1x Product 5 at $99.99

-- For even older orders
(11, 2, 1, 159.99), -- Order 11: 1x Product 2 at $159.99
(12, 1, 1, 219.99), -- Order 12: 1x Product 1 at $219.99
(13, 3, 1, 179.99); -- Order 13: 1x Product 3 at $179.99

-- Update order totals to match item totals (optional, for data consistency)
UPDATE orders SET total_amount = (
  SELECT SUM(quantity * price) 
  FROM order_items 
  WHERE order_items.order_id = orders.id
) WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);

-- Verify the data was created correctly
SELECT 
  o.id as order_id,
  o.total_amount,
  o.status,
  o.payment_method,
  o.created_at,
  COUNT(oi.id) as item_count,
  SUM(oi.quantity * oi.price) as calculated_total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '120 days'
GROUP BY o.id, o.total_amount, o.status, o.payment_method, o.created_at
ORDER BY o.created_at DESC;

-- Check product sales
SELECT 
  p.id,
  p.name,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= NOW() - INTERVAL '120 days'
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- Alternative approach if you need to create users first:
/*
-- Create sample users (if needed)
INSERT INTO users (email, first_name, last_name, role, is_approved) VALUES
('customer1@example.com', 'John', 'Doe', 'customer', true),
('customer2@example.com', 'Jane', 'Smith', 'customer', true),
('customer3@example.com', 'Bob', 'Johnson', 'customer', true);

-- Create sample products (if needed)
INSERT INTO products (name, description, condition_status, price, quantity, category_id) VALUES
('Brake Pads Set', 'High-quality brake pads for most vehicles', 'New', 149.99, 50, 1),
('Oil Filter', 'Premium oil filter for engine protection', 'New', 24.99, 100, 1),
('Headlight Assembly', 'Complete headlight assembly with bulbs', 'Used - Like New', 299.99, 25, 2),
('Air Filter', 'High-flow air filter for better performance', 'New', 39.99, 75, 1),
('Spark Plugs Set', 'Platinum spark plugs set of 4', 'New', 89.99, 60, 1);
*/

-- Instructions for use:
-- 1. First check your existing users: SELECT id, email FROM users WHERE role = 'customer' LIMIT 5;
-- 2. Check your existing products: SELECT id, name, price FROM products LIMIT 10;
-- 3. Update the user_id and product_id values in the INSERT statements above
-- 4. Run this script in your Supabase SQL Editor
-- 5. Check the financial analytics dashboard to see the data
