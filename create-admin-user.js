const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function createAdminUser() {
  console.log('🔧 Creating admin user...')

  try {
    const adminEmail = 'admin@yamahaparts.com'
    const adminPassword = 'admin123'

    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (existingUser) {
      console.log('✅ Admin user already exists:', existingUser.email)
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password:', adminPassword)
      console.log('👤 Role:', existingUser.role)
      return
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing admin:', checkError)
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create admin user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email: adminEmail,
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      }])
      .select()
      .single()

    if (createError) {
      console.error('Error creating admin user:', createError)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 User ID:', newUser.id)
    console.log('🎯 Role:', newUser.role)
    console.log('')
    console.log('🚀 You can now login to the admin panel at: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error)
  }
}

createAdminUser()
