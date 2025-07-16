const { supabaseAdmin } = require('../../lib/supabase')
const jwt = require('jsonwebtoken')

// JWT secret for token verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to verify JWT token and check admin role
function verifyAdminToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

module.exports = async function handler(req, res) {
  console.log('🔍 User approval API called')
  console.log('Request method:', req.method)
  console.log('Request body:', req.body)

  // Verify admin authentication
  const adminUser = verifyAdminToken(req)
  if (!adminUser) {
    return res.status(403).json({ message: 'Admin access required' })
  }

  if (req.method === 'GET') {
    // Get pending users for approval
    try {
      // First check if status column exists
      const { data: pendingUsers, error } = await supabaseAdmin
        .from('users')
        .select('id, email, first_name, last_name, phone, address, status, created_at')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching pending users:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })

        // Check if it's a column not found error
        if (error.message?.includes('status') || error.code === 'PGRST116') {
          return res.status(500).json({
            message: 'Database not configured for user approval system. Please run the SQL migration first.',
            migration_required: true
          })
        }

        return res.status(500).json({
          message: 'Failed to fetch pending users',
          error: error.message
        })
      }

      console.log(`✅ Found ${pendingUsers?.length || 0} pending users`)
      res.status(200).json({
        success: true,
        data: pendingUsers || [],
        count: pendingUsers?.length || 0
      })

    } catch (error) {
      console.error('❌ Error in pending users API:', error)
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      })
    }

  } else if (req.method === 'POST') {
    // Approve or reject user
    const { user_id, action, reason } = req.body

    if (!user_id || !action) {
      return res.status(400).json({ 
        message: 'User ID and action (approve/reject/suspend) are required' 
      })
    }

    if (!['approve', 'reject', 'suspend'].includes(action)) {
      return res.status(400).json({ 
        message: 'Action must be approve, reject, or suspend' 
      })
    }

    try {
      // Get user details first
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, first_name, last_name, status')
        .eq('id', user_id)
        .single()

      if (userError || !user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Update user status
      let newStatus
      let message
      
      switch (action) {
        case 'approve':
          newStatus = 'active'
          message = `User ${user.email} has been approved and can now login`
          break
        case 'reject':
          newStatus = 'rejected'
          message = `User ${user.email} has been rejected`
          break
        case 'suspend':
          newStatus = 'suspended'
          message = `User ${user.email} has been suspended`
          break
      }

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          approval_reason: reason || null,
          approved_at: action === 'approve' ? new Date().toISOString() : null
        })
        .eq('id', user_id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user status:', updateError)
        return res.status(500).json({ message: 'Failed to update user status' })
      }

      console.log(`✅ User ${action}d successfully:`, updatedUser.email)
      
      res.status(200).json({
        success: true,
        message,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          status: updatedUser.status,
          approved_at: updatedUser.approved_at
        }
      })

    } catch (error) {
      console.error('Error in user approval API:', error)
      res.status(500).json({ message: 'Internal server error' })
    }

  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
