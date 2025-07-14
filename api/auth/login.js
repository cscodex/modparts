const { supabaseAdmin } = require('../../lib/supabase')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = async function handler(req, res) {
  // CORS is handled by dev-server middleware

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Login attempt for:', req.body?.email);
    console.log('Environment check:');
    console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');

    const { email, password } = req.body

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' })
    }

    console.log('Attempting Supabase query for user:', email);

    // Get user from Supabase using admin client to bypass RLS
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    console.log('Supabase query result:');
    console.log('- Error:', error);
    console.log('- User found:', user ? 'Yes' : 'No');

    if (error || !user) {
      console.log('Login failed: Invalid credentials or user not found');
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    })
  }
}
