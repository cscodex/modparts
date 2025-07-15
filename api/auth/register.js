const { supabaseAdmin } = require('../../lib/supabase')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { generateVerificationToken, getExpirationTime, sendVerificationEmail } = require('../../lib/emailService')

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

    // Generate email verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = getExpirationTime()

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
          role: 'customer',
          email_verified: false,
          email_verification_token: verificationToken,
          email_verification_expires: verificationExpires.toISOString(),
          email_verification_sent_at: new Date().toISOString()
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

    // Send verification email
    try {
      await sendVerificationEmail(email, first_name, verificationToken)
      console.log('✅ Verification email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can request resend
    }

    // Don't generate JWT token yet - user needs to verify email first
    console.log('✅ Registration completed - verification email sent')

    // Return user data without token (user needs to verify email first)
    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        email_verified: false
      },
      verification_required: true
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
