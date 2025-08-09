// Financial Analytics API Endpoint (Vercel Compatible)
// Provides comprehensive financial reporting and analytics

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { period = '30', type = 'overview' } = req.query

    console.log(`📊 Fetching financial analytics - Period: ${period} days, Type: ${type}`)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    const startDateStr = startDate.toISOString()
    const endDateStr = endDate.toISOString()

    switch (type) {
      case 'overview':
        return await getFinancialOverview(res, startDateStr, endDateStr)
      case 'revenue':
        return await getRevenueAnalytics(res, startDateStr, endDateStr)
      case 'orders':
        return await getOrderAnalytics(res, startDateStr, endDateStr)
      case 'products':
        return await getProductAnalytics(res, startDateStr, endDateStr)
      case 'customers':
        return await getCustomerAnalytics(res, startDateStr, endDateStr)
      case 'export':
        return await exportFinancialData(res, startDateStr, endDateStr)
      default:
        return res.status(400).json({ message: 'Invalid analytics type' })
    }

  } catch (error) {
    console.error('Financial analytics error:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

// Financial Overview Analytics
async function getFinancialOverview(res, startDate, endDate) {
  try {
    // Total revenue in period
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount, status, created_at, payment_method')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    // Calculate revenue metrics
    const totalRevenue = revenueData?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0
    const completedRevenue = revenueData?.filter(order => ['delivered', 'completed'].includes(order.status))
      .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0
    const pendingRevenue = revenueData?.filter(order => ['pending', 'processing', 'shipped'].includes(order.status))
      .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0

    // Order counts
    const totalOrders = revenueData?.length || 0
    const completedOrders = revenueData?.filter(order => ['delivered', 'completed'].includes(order.status)).length || 0
    const pendingOrders = revenueData?.filter(order => ['pending', 'processing', 'shipped'].includes(order.status)).length || 0

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Daily revenue breakdown
    const dailyRevenue = {}
    revenueData?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (parseFloat(order.total_amount) || 0)
    })

    // Revenue by payment method
    const revenueByPaymentMethod = {}
    revenueData?.forEach(order => {
      const method = order.payment_method || 'unknown'
      revenueByPaymentMethod[method] = (revenueByPaymentMethod[method] || 0) + (parseFloat(order.total_amount) || 0)
    })

    return res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        revenue: {
          total: totalRevenue,
          completed: completedRevenue,
          pending: pendingRevenue,
          averageOrderValue
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders
        },
        trends: {
          dailyRevenue,
          revenueByPaymentMethod
        }
      }
    })

  } catch (error) {
    console.error('Error in getFinancialOverview:', error)
    throw error
  }
}

// Revenue Analytics with detailed breakdown
async function getRevenueAnalytics(res, startDate, endDate) {
  try {
    // Revenue by month
    const { data: monthlyData } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true })

    // Group by month
    const monthlyRevenue = {}
    monthlyData?.forEach(order => {
      const month = new Date(order.created_at).toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = { total: 0, completed: 0, pending: 0, orders: 0 }
      }
      const amount = parseFloat(order.total_amount) || 0
      monthlyRevenue[month].total += amount
      monthlyRevenue[month].orders += 1
      
      if (['delivered', 'completed'].includes(order.status)) {
        monthlyRevenue[month].completed += amount
      } else {
        monthlyRevenue[month].pending += amount
      }
    })

    // Revenue growth calculation
    const months = Object.keys(monthlyRevenue).sort()
    const revenueGrowth = []
    for (let i = 1; i < months.length; i++) {
      const currentMonth = monthlyRevenue[months[i]]
      const previousMonth = monthlyRevenue[months[i - 1]]
      const growth = previousMonth.total > 0 
        ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100 
        : 0
      revenueGrowth.push({
        month: months[i],
        growth: growth.toFixed(2)
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        monthlyRevenue,
        revenueGrowth,
        totalRevenue: Object.values(monthlyRevenue).reduce((sum, month) => sum + month.total, 0)
      }
    })

  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error)
    throw error
  }
}

// Order Analytics
async function getOrderAnalytics(res, startDate, endDate) {
  try {
    // Order status distribution
    const { data: orderStatusData } = await supabase
      .from('orders')
      .select('status, total_amount, created_at, updated_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const statusDistribution = {}
    const fulfillmentTimes = []

    orderStatusData?.forEach(order => {
      const status = order.status || 'unknown'
      if (!statusDistribution[status]) {
        statusDistribution[status] = { count: 0, revenue: 0 }
      }
      statusDistribution[status].count += 1
      statusDistribution[status].revenue += parseFloat(order.total_amount) || 0

      // Calculate fulfillment time for completed orders
      if (['delivered', 'completed'].includes(order.status) && order.updated_at) {
        const created = new Date(order.created_at)
        const updated = new Date(order.updated_at)
        const days = Math.round((updated - created) / (1000 * 60 * 60 * 24))
        fulfillmentTimes.push(days)
      }
    })

    const averageFulfillmentTime = fulfillmentTimes.length > 0 
      ? fulfillmentTimes.reduce((sum, time) => sum + time, 0) / fulfillmentTimes.length 
      : 0

    return res.status(200).json({
      success: true,
      data: {
        statusDistribution,
        fulfillmentMetrics: {
          averageFulfillmentTime: averageFulfillmentTime.toFixed(1),
          totalFulfilledOrders: fulfillmentTimes.length
        }
      }
    })

  } catch (error) {
    console.error('Error in getOrderAnalytics:', error)
    throw error
  }
}

// Product Performance Analytics
async function getProductAnalytics(res, startDate, endDate) {
  try {
    // Get order items with product details for the period
    const { data: orderItemsData } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        product_id,
        products (
          id,
          name,
          category_id,
          categories (
            name
          )
        ),
        orders!inner (
          created_at
        )
      `)
      .gte('orders.created_at', startDate)
      .lte('orders.created_at', endDate)

    const productPerformance = {}
    orderItemsData?.forEach(item => {
      const productId = item.product_id
      if (!productId || !item.products) return

      if (!productPerformance[productId]) {
        productPerformance[productId] = {
          name: item.products.name,
          category: item.products.categories?.name || 'Uncategorized',
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0
        }
      }

      productPerformance[productId].totalQuantity += item.quantity || 0
      productPerformance[productId].totalRevenue += (item.quantity || 0) * (parseFloat(item.price) || 0)
      productPerformance[productId].orderCount += 1
    })

    // Sort by revenue and get top 10
    const topProducts = Object.entries(productPerformance)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    return res.status(200).json({
      success: true,
      data: {
        topProducts,
        totalProductsSold: Object.keys(productPerformance).length
      }
    })

  } catch (error) {
    console.error('Error in getProductAnalytics:', error)
    throw error
  }
}

// Customer Analytics
async function getCustomerAnalytics(res, startDate, endDate) {
  try {
    // Customer order data
    const { data: customerOrderData } = await supabase
      .from('orders')
      .select(`
        user_id,
        total_amount,
        created_at,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const customerMetrics = {}
    customerOrderData?.forEach(order => {
      const userId = order.user_id
      if (!userId) return

      if (!customerMetrics[userId]) {
        customerMetrics[userId] = {
          email: order.users?.email,
          name: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim(),
          orderCount: 0,
          totalSpent: 0,
          firstOrder: order.created_at,
          lastOrder: order.created_at
        }
      }

      customerMetrics[userId].orderCount += 1
      customerMetrics[userId].totalSpent += parseFloat(order.total_amount) || 0
      
      if (new Date(order.created_at) > new Date(customerMetrics[userId].lastOrder)) {
        customerMetrics[userId].lastOrder = order.created_at
      }
    })

    // Top customers by spending
    const topCustomers = Object.entries(customerMetrics)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // Customer metrics
    const totalCustomers = Object.keys(customerMetrics).length
    const totalRevenue = Object.values(customerMetrics).reduce((sum, customer) => sum + customer.totalSpent, 0)
    const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    return res.status(200).json({
      success: true,
      data: {
        topCustomers,
        metrics: {
          totalCustomers,
          averageCustomerValue: averageCustomerValue.toFixed(2),
          totalRevenue: totalRevenue.toFixed(2)
        }
      }
    })

  } catch (error) {
    console.error('Error in getCustomerAnalytics:', error)
    throw error
  }
}

// Export Financial Data
async function exportFinancialData(res, startDate, endDate) {
  try {
    // Get comprehensive order data for export
    const { data: exportData } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        payment_method,
        created_at,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    // Format data for CSV export
    const csvData = exportData?.map(order => ({
      order_id: order.id,
      customer_email: order.users?.email || '',
      customer_name: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim(),
      total_amount: order.total_amount,
      status: order.status,
      payment_method: order.payment_method,
      order_date: new Date(order.created_at).toLocaleDateString()
    })) || []

    return res.status(200).json({
      success: true,
      data: csvData,
      summary: {
        totalOrders: csvData.length,
        totalRevenue: csvData.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
        dateRange: { startDate, endDate }
      }
    })

  } catch (error) {
    console.error('Error in exportFinancialData:', error)
    throw error
  }
}
