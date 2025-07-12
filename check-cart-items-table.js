// Check the cart_items table structure and foreign key constraints
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./lib/supabase');

async function checkCartItemsTable() {
  console.log('🔍 Checking cart_items table structure...\n');

  try {
    // Try to get one cart item to see the column structure
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error querying cart_items table:', error);
    } else if (cartItems && cartItems.length > 0) {
      console.log('✅ Cart_items table structure:');
      console.log('Columns:', Object.keys(cartItems[0]));
      console.log('Sample cart item:', cartItems[0]);
    } else {
      console.log('⚠️ Cart_items table is empty');
    }

    // Try to insert a test record to see what happens
    console.log('\n🧪 Testing insert with existing user...');
    
    // Get an existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (existingUser) {
      console.log('Found existing user:', existingUser.id);
      
      // Try to insert a cart item
      const { data: testInsert, error: insertError } = await supabase
        .from('cart_items')
        .insert([{
          user_id: existingUser.id,
          product_id: 1,
          quantity: 1
        }])
        .select();

      if (insertError) {
        console.log('❌ Insert error:', insertError);
      } else {
        console.log('✅ Insert successful:', testInsert);
        
        // Clean up - delete the test record
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', existingUser.id)
          .eq('product_id', 1);
      }
    }

  } catch (error) {
    console.error('❌ Failed to check cart_items table:', error);
  }
}

checkCartItemsTable();
