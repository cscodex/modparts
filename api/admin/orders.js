const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

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
    
    // Check if user has admin role (you may need to adjust this based on your user structure)
    if (decoded.role !== 'admin') {
      return null
    }
    
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Verify admin access
  const adminUser = verifyAdminToken(req)
  if (!adminUser) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }

  try {
    if (req.method === 'GET') {
      // Get all orders with user information
      console.log('📋 Admin fetching all orders...')
      
      // First get all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch orders',
          error: error.message
        })
      }

      // Then manually fetch user data for each order
      const ordersWithUsers = []
      for (const order of orders || []) {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, phone')
          .eq('id', order.user_id)
          .single()

        // Create a comprehensive order object with customer information
        const orderWithUser = {
          ...order,
          user: userError ? null : user,
          // Add customer fields for easier frontend access
          customer_name: user && !userError
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer',
          customer_email: user?.email || order.email || 'No email provided',
          customer_phone: user?.phone || order.phone || null
        }

        ordersWithUsers.push(orderWithUser)
      }

      console.log(`✅ Successfully fetched ${ordersWithUsers.length} orders`)

      return res.status(200).json({
        success: true,
        data: ordersWithUsers,
        count: ordersWithUsers.length
      })

    } else if (req.method === 'PUT') {
      // Update order status
      const { id, status } = req.body

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and status are required'
        })
      }

      console.log('📝 Admin updating order status:', id, 'to', status)

      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating order:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to update order',
          error: error.message
        })
      }

      console.log('✅ Order updated successfully:', order.id)

      return res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: order
      })

    } else if (req.method === 'DELETE') {
      // Delete order
      const orderId = req.query.id || req.body.id

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        })
      }

      console.log('🗑️ Admin deleting order:', orderId)

      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)

      if (itemsError) {
        console.error('Error deleting order items:', itemsError)
        return res.status(500).json({
          success: false,
          message: 'Failed to delete order items',
          error: itemsError.message
        })
      }

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) {
        console.error('Error deleting order:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to delete order',
          error: error.message
        })
      }

      console.log('✅ Order deleted successfully:', orderId)

      return res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
      })

    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      })
    }

  } catch (error) {
    console.error('Admin orders API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}
