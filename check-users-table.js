// Check the users table structure
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./lib/supabase');

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');

  try {
    // Try to get one user to see the column structure
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error querying users table:', error);
      return;
    }

    if (users && users.length > 0) {
      console.log('✅ Users table structure:');
      console.log('Columns:', Object.keys(users[0]));
      console.log('Sample user:', users[0]);
    } else {
      console.log('⚠️ Users table is empty, trying to describe structure...');
      
      // Try inserting a test record to see what columns are expected
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([{ email: 'test@test.com' }])
        .select();
      
      if (insertError) {
        console.log('Insert error (shows required columns):', insertError);
      }
    }

  } catch (error) {
    console.error('❌ Failed to check users table:', error);
  }
}

checkUsersTable();
