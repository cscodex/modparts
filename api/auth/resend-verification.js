const { supabaseAdmin } = require('../../lib/supabase')
const { generateVerificationToken, getExpirationTime, sendVerificationEmail } = require('../../lib/emailService')

module.exports = async function handler(req, res) {
  console.log('🔍 Resend verification API called')
  console.log('Request method:', req.method)
  console.log('Request body:', req.body)

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      })
    }

    // Find user with this email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, email_verified, email_verification_sent_at')
      .eq('email', email)
      .single()

    if (error || !user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account with this email exists, a verification email has been sent.' 
      })
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ 
        message: 'Email is already verified' 
      })
    }

    // Check rate limiting - don't allow resend within 1 minute
    if (user.email_verification_sent_at) {
      const lastSent = new Date(user.email_verification_sent_at)
      const now = new Date()
      const timeDiff = (now - lastSent) / 1000 / 60 // minutes
      
      if (timeDiff < 1) {
        return res.status(429).json({ 
          message: 'Please wait at least 1 minute before requesting another verification email.',
          retry_after: Math.ceil(60 - (timeDiff * 60)) // seconds
        })
      }
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = getExpirationTime()

    // Update user with new verification token
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires.toISOString(),
        email_verification_sent_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating verification token:', updateError)
      return res.status(500).json({ message: 'Failed to generate new verification token' })
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.first_name, verificationToken)
      console.log('✅ Verification email resent successfully to:', user.email)
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError)
      return res.status(500).json({ message: 'Failed to send verification email' })
    }

    res.status(200).json({
      message: 'Verification email sent successfully! Please check your inbox.',
      email_sent: true
    })

  } catch (error) {
    console.error('❌ Resend verification error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}
