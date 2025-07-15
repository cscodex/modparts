const { supabaseAdmin } = require('../../lib/supabase')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = async function handler(req, res) {
  // CORS is handled by dev-server middleware
  console.log('🔍 Registration API called')
  console.log('Request method:', req.method)
  console.log('Request body:', req.body)

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password, first_name, last_name, phone, address } = req.body

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        message: 'Email, password, first name, and last name are required' 
      })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Supabase using admin client to bypass RLS
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          phone: phone || null,
          address: address || null,
          role: 'customer'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Registration error:', error)
      return res.status(500).json({ message: 'Failed to create user' })
    }

    console.log('✅ User created successfully:', { id: newUser.id, email: newUser.email })

    // Verify user was actually created by querying it back
    const { data: verifyUser, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', newUser.id)
      .single()

    if (verifyError || !verifyUser) {
      console.log('❌ User verification failed:', verifyError)
      return res.status(500).json({ message: 'User creation verification failed' })
    }

    console.log('✅ User verified in database:', verifyUser)

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    console.log('🔑 JWT token created for user ID:', newUser.id)

    // Return user data and token
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role
      }
    })

  } catch (error) {
    console.error('❌ Registration error:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error message:', error.message)
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
