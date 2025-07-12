// Diagnose foreign key constraint issue
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./lib/supabase');

async function diagnoseForeignKey() {
  console.log('🔍 Diagnosing foreign key constraint issue...\n');

  try {
    // Check users table
    console.log('1️⃣ Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(3);

    if (usersError) {
      console.log('❌ Error querying users:', usersError);
      return;
    }

    console.log('✅ Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ID: ${user.id} (type: ${typeof user.id}, length: ${user.id.length})`);
      console.log(`    Email: ${user.email}`);
    });

    // Try to manually check if the user exists using raw SQL-like approach
    console.log('\n2️⃣ Testing user existence with different approaches...');
    const testUserId = users[0].id;
    
    // Method 1: Direct select
    const { data: user1, error: error1 } = await supabase
      .from('users')
      .select('id')
      .eq('id', testUserId)
      .single();
    
    console.log('Method 1 (direct select):', user1 ? '✅ Found' : '❌ Not found', error1 || '');

    // Method 2: Count
    const { count, error: error2 } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('id', testUserId);
    
    console.log('Method 2 (count):', count > 0 ? '✅ Found' : '❌ Not found', `(count: ${count})`, error2 || '');

    // Check if we can insert into cart_items without foreign key by temporarily disabling it
    console.log('\n3️⃣ Testing cart_items insert...');
    
    // First, let's see what happens if we try to insert with a completely fake user ID
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const { data: fakeInsert, error: fakeError } = await supabase
      .from('cart_items')
      .insert([{
        user_id: fakeUserId,
        product_id: 1,
        quantity: 1
      }]);

    console.log('Fake user insert result:', fakeError ? '❌ Failed' : '✅ Success');
    if (fakeError) {
      console.log('Fake user error:', fakeError.message);
    }

    // Now try with the real user ID
    const { data: realInsert, error: realError } = await supabase
      .from('cart_items')
      .insert([{
        user_id: testUserId,
        product_id: 1,
        quantity: 1
      }]);

    console.log('Real user insert result:', realError ? '❌ Failed' : '✅ Success');
    if (realError) {
      console.log('Real user error:', realError.message);
      console.log('Real user error details:', realError.details);
    } else {
      // Clean up
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', testUserId)
        .eq('product_id', 1);
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

diagnoseForeignKey();
