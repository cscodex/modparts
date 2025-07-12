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

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only GET requests are supported.'
    })
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
    console.log('📊 Admin fetching dashboard data...')

    // Get total products
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (productsError) {
      console.error('Error fetching products count:', productsError)
    }

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    if (ordersError) {
      console.error('Error fetching orders count:', ordersError)
    }

    // Get total customers (users with role 'customer')
    const { count: totalCustomers, error: customersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    if (customersError) {
      console.error('Error fetching customers count:', customersError)
    }

    // Get total revenue (sum of all order amounts)
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')

    let totalRevenue = 0
    if (!revenueError && revenueData) {
      totalRevenue = revenueData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    }

    // Get recent orders with user information
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentOrdersError) {
      console.error('Error fetching recent orders:', recentOrdersError)
    }

    // Get orders by status
    const { data: ordersByStatus, error: ordersByStatusError } = await supabase
      .from('orders')
      .select('status')

    let ordersStatusCounts = {}
    if (!ordersByStatusError && ordersByStatus) {
      ordersStatusCounts = ordersByStatus.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {})
    }

    // Get low stock products (assuming we have a quantity field)
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('id, name, quantity')
      .lte('quantity', 5)
      .order('quantity', { ascending: true })
      .limit(5)

    if (lowStockError) {
      console.error('Error fetching low stock products:', lowStockError)
    }

    const dashboardData = {
      total_products: totalProducts || 0,
      total_orders: totalOrders || 0,
      total_customers: totalCustomers || 0,
      total_revenue: totalRevenue,
      orders_by_status: ordersStatusCounts,
      recent_orders: recentOrders || [],
      low_stock: lowStockProducts || []
    }

    console.log('✅ Dashboard data fetched successfully')

    return res.status(200).json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Admin dashboard API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}
