const { supabaseAdmin } = require('../../lib/supabase')
const { verifyToken } = require('../../lib/auth')

module.exports = async function handler(req, res) {
  console.log('🔍 User approval API called')
  console.log('Request method:', req.method)
  console.log('Request body:', req.body)

  // Verify admin authentication
  try {
    const user = await verifyToken(req)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
  } catch (error) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  if (req.method === 'GET') {
    // Get pending users for approval
    try {
      const { data: pendingUsers, error } = await supabaseAdmin
        .from('users')
        .select('id, email, first_name, last_name, phone, address, status, created_at')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending users:', error)
        return res.status(500).json({ message: 'Failed to fetch pending users' })
      }

      console.log(`✅ Found ${pendingUsers.length} pending users`)
      res.status(200).json({
        success: true,
        data: pendingUsers,
        count: pendingUsers.length
      })

    } catch (error) {
      console.error('Error in pending users API:', error)
      res.status(500).json({ message: 'Internal server error' })
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
