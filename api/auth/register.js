const { supabaseAdmin } = require('../../lib/supabase')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Email verification is optional - only load if nodemailer is available
let emailService = null
try {
  emailService = require('../../lib/emailService')
} catch (error) {
  console.log('📧 Email service not available - email verification disabled')
}

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

    // Check if email verification is enabled
    const emailVerificationEnabled = emailService && process.env.SMTP_USER

    let verificationToken = null
    let verificationExpires = null

    if (emailVerificationEnabled) {
      verificationToken = emailService.generateVerificationToken()
      verificationExpires = emailService.getExpirationTime()
    }

    // Prepare user data - only include email verification fields if enabled
    const userData = {
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone: phone || null,
      address: address || null,
      role: 'customer'
    }

    // Add email verification fields only if enabled and database supports them
    if (emailVerificationEnabled) {
      userData.email_verified = false
      userData.email_verification_token = verificationToken
      userData.email_verification_expires = verificationExpires.toISOString()
      userData.email_verification_sent_at = new Date().toISOString()
    }

    // Create user in Supabase using admin client to bypass RLS
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      console.error('❌ Registration error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return res.status(500).json({
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }

    console.log('✅ User created successfully:', { id: newUser.id, email: newUser.email })

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

    // Send verification email if enabled
    if (emailVerificationEnabled && verificationToken) {
      try {
        await emailService.sendVerificationEmail(email, first_name, verificationToken)
        console.log('✅ Verification email sent successfully')

        // Return response requiring email verification
        return res.status(201).json({
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
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError)
        // Continue with normal registration if email fails
      }
    }

    // Normal registration without email verification
    console.log('✅ Registration completed successfully')
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        email_verified: emailVerificationEnabled ? false : true
      },
      token: emailVerificationEnabled ? undefined : token,
      verification_required: emailVerificationEnabled
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
