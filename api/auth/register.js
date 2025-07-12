const { supabase } = require('../../lib/supabase')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

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
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Supabase
    const { data: newUser, error } = await supabase
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
    const { data: verifyUser, error: verifyError } = await supabase
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
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
