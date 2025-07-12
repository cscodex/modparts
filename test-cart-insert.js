// Script to test direct cart insert to database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testCartInsert() {
  try {
    console.log('🔍 Testing direct cart insert to database...');
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    
    // Test user ID (admin user)
    const userId = '6126eb7e-1381-4060-aee7-66be0baca9b7';
    const productId = 88;
    
    console.log('User ID:', userId);
    console.log('Product ID:', productId);
    
    // First check if user exists
    console.log('\n👤 Checking if user exists...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.log('❌ User check error:', userError);
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Check if product exists
    console.log('\n📦 Checking if product exists...');
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, quantity')
      .eq('id', productId)
      .single();
    
    if (productError) {
      console.log('❌ Product check error:', productError);
      return;
    }
    
    console.log('✅ Product found:', product.name, 'Quantity:', product.quantity);
    
    // Check cart_items table structure
    console.log('\n🗃️ Checking cart_items table...');
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1);
    
    if (cartError) {
      console.log('❌ Cart table error:', cartError);
      return;
    }
    
    console.log('✅ Cart table accessible, sample structure:', cartItems[0] || 'No items');
    
    // Try to insert a cart item
    console.log('\n➕ Attempting to insert cart item...');
    const { data: newItem, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity: 1
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError);
      console.log('Error details:', JSON.stringify(insertError, null, 2));
      return;
    }
    
    console.log('✅ Cart item inserted successfully:', newItem);
    
    // Clean up - delete the test item
    console.log('\n🧹 Cleaning up test item...');
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', newItem.id);
    
    if (deleteError) {
      console.log('❌ Delete error:', deleteError);
    } else {
      console.log('✅ Test item cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCartInsert();
