// Quick script to check if users exist and create a test user if needed
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./lib/supabase');
const bcrypt = require('bcryptjs');

async function checkAndCreateUser() {
  console.log('=== CHECKING USER DATABASE ===');
  
  try {
    // Check if any users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(10);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      
      // Create a test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: 'test@example.com',
            password: hashedPassword,
            first_name: 'Test',
            last_name: 'User',
            role: 'customer'
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating test user:', createError);
        return;
      }
      
      console.log('✅ Test user created:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });
      
    } else {
      console.log('Existing users:');
      users.forEach(user => {
        console.log(`- ID: ${user.id} (${typeof user.id}), Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkAndCreateUser();
