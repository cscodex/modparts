// Database setup script to create missing tables in Supabase
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./lib/supabase');

async function setupDatabase() {
  console.log('🗄️ Setting up Supabase database tables...\n');

  try {
    // Check if cart_items table exists
    console.log('1️⃣ Checking cart_items table...');
    const { data: cartItemsCheck, error: cartItemsError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);

    if (cartItemsError && cartItemsError.code === '42P01') {
      console.log('❌ cart_items table does not exist');
      console.log('📝 Please create the cart_items table in your Supabase dashboard with the following SQL:');
      console.log(`
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Enable RLS (Row Level Security)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);
      `);
    } else if (cartItemsError) {
      console.log('⚠️ Error checking cart_items table:', cartItemsError.message);
    } else {
      console.log('✅ cart_items table exists');
    }

    // Check if orders table exists
    console.log('\n2️⃣ Checking orders table...');
    const { data: ordersCheck, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (ordersError && ordersError.code === '42P01') {
      console.log('❌ orders table does not exist');
      console.log('📝 Please create the orders table in your Supabase dashboard with the following SQL:');
      console.log(`
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for order_items
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
      `);
    } else if (ordersError) {
      console.log('⚠️ Error checking orders table:', ordersError.message);
    } else {
      console.log('✅ orders table exists');
    }

    // Check users table structure
    console.log('\n3️⃣ Checking users table structure...');
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .limit(1);

    if (usersError) {
      console.log('❌ Error checking users table:', usersError.message);
      console.log('📝 Please ensure the users table exists with the following structure:');
      console.log(`
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
      `);
    } else {
      console.log('✅ users table exists and accessible');
    }

    console.log('\n🎯 Database Setup Summary:');
    console.log('1. Copy the SQL statements above');
    console.log('2. Go to your Supabase dashboard > SQL Editor');
    console.log('3. Paste and run each SQL block');
    console.log('4. Restart the development server');
    console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard/project/uwizdypmlvfvegklnogq');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
setupDatabase();
