// Financial Analytics API Endpoint
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
    const { period = '30', type = 'overview', startDate: customStartDate, endDate: customEndDate } = req.query

    let startDateStr, endDateStr

    // Use custom date range if provided, otherwise use period
    if (customStartDate && customEndDate) {
      console.log(`📊 Fetching financial analytics - Custom range: ${customStartDate} to ${customEndDate}, Type: ${type}`)
      startDateStr = new Date(customStartDate).toISOString()
      endDateStr = new Date(customEndDate + 'T23:59:59.999Z').toISOString() // Include full end date
    } else {
      console.log(`📊 Fetching financial analytics - Period: ${period} days, Type: ${type}`)
      // Calculate date range from period
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(period))

      startDateStr = startDate.toISOString()
      endDateStr = endDate.toISOString()
    }

    // Add a simple test endpoint
    if (type === 'test') {
      return res.status(200).json({
        success: true,
        message: 'Analytics API is working!',
        timestamp: new Date().toISOString(),
        dateRange: { startDateStr, endDateStr },
        supabaseConnected: !!supabase
      })
    }

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
        return res.status(400).json({
          success: false,
          message: 'Invalid analytics type',
          availableTypes: ['overview', 'revenue', 'orders', 'products', 'customers', 'export', 'test']
        })
    }

  } catch (error) {
    console.error('❌ Financial analytics error:', error)
    console.error('❌ Error stack:', error.stack)

    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      errorMessage = 'Database table not found. Please check database setup.'
    } else if (error.message.includes('permission denied')) {
      errorMessage = 'Database permission error. Please check RLS policies.'
    } else if (error.message.includes('connection')) {
      errorMessage = 'Database connection error. Please try again.'
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      type: type || 'unknown'
    })
  }
}

// Financial Overview Analytics
async function getFinancialOverview(res, startDate, endDate) {
  try {
    // Total revenue in period
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount, status, created_at')
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
    const { data: paymentMethodData } = await supabase
      .from('orders')
      .select('payment_method, total_amount')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const revenueByPaymentMethod = {}
    paymentMethodData?.forEach(order => {
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
      .select('status, total_amount, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const statusDistribution = {}
    orderStatusData?.forEach(order => {
      const status = order.status || 'unknown'
      if (!statusDistribution[status]) {
        statusDistribution[status] = { count: 0, revenue: 0 }
      }
      statusDistribution[status].count += 1
      statusDistribution[status].revenue += parseFloat(order.total_amount) || 0
    })

    // Order fulfillment metrics
    const { data: fulfillmentData } = await supabase
      .from('orders')
      .select('created_at, updated_at, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .in('status', ['delivered', 'completed'])

    const fulfillmentTimes = fulfillmentData?.map(order => {
      const created = new Date(order.created_at)
      const updated = new Date(order.updated_at)
      return Math.round((updated - created) / (1000 * 60 * 60 * 24)) // days
    }) || []

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
    console.log(`🛍️ Fetching product analytics from ${startDate} to ${endDate}`)

    // First, let's check if we have any order_items at all
    const { data: orderItemsCheck, error: checkError } = await supabase
      .from('order_items')
      .select('id')
      .limit(1)

    console.log('Order items check:', { orderItemsCheck, checkError })

    // Top selling products
    const { data: productSalesData, error: productSalesError } = await supabase
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

    console.log('Product sales data:', { productSalesData, productSalesError, count: productSalesData?.length })

    if (productSalesError) {
      console.error('Error fetching product sales data:', productSalesError)
      // Return empty data instead of throwing error
      return res.status(200).json({
        success: true,
        data: {
          topProducts: [],
          totalProductsSold: 0
        }
      })
    }

    const productPerformance = {}

    if (productSalesData && productSalesData.length > 0) {
      productSalesData.forEach(item => {
        const productId = item.product_id || item.products?.id
        if (!productId || !item.products) {
          console.log('Skipping item - missing product data:', item)
          return
        }

        if (!productPerformance[productId]) {
          productPerformance[productId] = {
            name: item.products.name || 'Unknown Product',
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
    }

    // Sort by revenue
    const topProducts = Object.entries(productPerformance)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    console.log('Final product performance:', {
      totalProducts: Object.keys(productPerformance).length,
      topProductsCount: topProducts.length
    })

    return res.status(200).json({
      success: true,
      data: {
        topProducts,
        totalProductsSold: Object.keys(productPerformance).length
      }
    })

  } catch (error) {
    console.error('Error in getProductAnalytics:', error)
    // Return empty data instead of throwing error
    return res.status(200).json({
      success: true,
      data: {
        topProducts: [],
        totalProductsSold: 0
      }
    })
  }
}

// Customer Analytics
async function getCustomerAnalytics(res, startDate, endDate) {
  try {
    // Customer order frequency
    const { data: customerOrderData } = await supabase
      .from('orders')
      .select(`
        user_id,
        total_amount,
        created_at,
        users (
          email,
          first_name,
          last_name,
          created_at
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

    // Customer lifetime value
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
    console.log(`📤 Exporting financial data from ${startDate} to ${endDate}`)

    // First, try a simple query to check if orders table exists and has data
    const { data: simpleOrders, error: simpleError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .limit(5)

    if (simpleError) {
      console.error('❌ Error with simple orders query:', simpleError)
      throw new Error(`Database error: ${simpleError.message}`)
    }

    console.log(`📊 Simple query found ${simpleOrders?.length || 0} orders`)

    // If simple query works, try the comprehensive query
    const { data: exportData, error: exportError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        payment_method,
        shipping_address,
        created_at,
        updated_at,
        user_id,
        order_items (
          quantity,
          price,
          product_id
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (exportError) {
      console.error('❌ Error fetching export data:', exportError)
      throw new Error(`Export query error: ${exportError.message}`)
    }

    console.log(`📊 Found ${exportData?.length || 0} orders for export`)

    // Get user data separately to avoid complex joins
    const userIds = [...new Set(exportData?.map(order => order.user_id).filter(Boolean))]
    let usersData = {}

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone')
        .in('id', userIds)

      if (!usersError && users) {
        usersData = users.reduce((acc, user) => {
          acc[user.id] = user
          return acc
        }, {})
      }
    }

    // Get product data separately
    const productIds = []
    exportData?.forEach(order => {
      order.order_items?.forEach(item => {
        if (item.product_id) productIds.push(item.product_id)
      })
    })

    const uniqueProductIds = [...new Set(productIds)]
    let productsData = {}

    if (uniqueProductIds.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku')
        .in('id', uniqueProductIds)

      if (!productsError && products) {
        productsData = products.reduce((acc, product) => {
          acc[product.id] = product
          return acc
        }, {})
      }
    }

    // Format data for CSV export with detailed information
    const csvData = []

    if (!exportData || exportData.length === 0) {
      console.log('⚠️ No orders found for the specified date range')
      return res.status(200).json({
        success: true,
        data: [],
        summary: {
          totalOrders: 0,
          totalItems: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          dateRange: { startDate, endDate },
          exportedRows: 0,
          message: 'No orders found for the specified date range'
        }
      })
    }

    exportData.forEach(order => {
      const user = usersData[order.user_id] || {}

      if (order.order_items && order.order_items.length > 0) {
        // Create a row for each order item for detailed analysis
        order.order_items.forEach(item => {
          const product = productsData[item.product_id] || {}

          csvData.push({
            order_id: order.id,
            order_date: new Date(order.created_at).toLocaleDateString(),
            order_time: new Date(order.created_at).toLocaleTimeString(),
            customer_email: user.email || '',
            customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
            customer_phone: user.phone || '',
            order_total: parseFloat(order.total_amount) || 0,
            order_status: order.status || '',
            payment_method: order.payment_method || '',
            shipping_address: order.shipping_address || '',
            product_name: product.name || 'Unknown Product',
            product_sku: product.sku || '',
            product_category: '', // Will add category lookup later if needed
            item_quantity: item.quantity || 0,
            item_price: parseFloat(item.price) || 0,
            item_total: (parseFloat(item.price) || 0) * (item.quantity || 0),
            updated_at: new Date(order.updated_at || order.created_at).toLocaleDateString()
          })
        })
      } else {
        // Create a single row for orders without items
        csvData.push({
          order_id: order.id,
          order_date: new Date(order.created_at).toLocaleDateString(),
          order_time: new Date(order.created_at).toLocaleTimeString(),
          customer_email: user.email || '',
          customer_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
          customer_phone: user.phone || '',
          order_total: parseFloat(order.total_amount) || 0,
          order_status: order.status || '',
          payment_method: order.payment_method || '',
          shipping_address: order.shipping_address || '',
          product_name: 'No items',
          product_sku: '',
          product_category: '',
          item_quantity: 0,
          item_price: 0,
          item_total: 0,
          updated_at: new Date(order.updated_at || order.created_at).toLocaleDateString()
        })
      }
    })

    console.log(`📊 Processed ${csvData.length} rows for CSV export`)

    // Calculate summary statistics
    const uniqueOrders = [...new Set(csvData.map(row => row.order_id))]
    const totalRevenue = csvData.reduce((sum, row) => sum + (row.order_total || 0), 0)
    const totalItems = csvData.reduce((sum, row) => sum + (row.item_quantity || 0), 0)

    return res.status(200).json({
      success: true,
      data: csvData,
      summary: {
        totalOrders: uniqueOrders.length,
        totalItems: totalItems,
        totalRevenue: totalRevenue,
        averageOrderValue: uniqueOrders.length > 0 ? totalRevenue / uniqueOrders.length : 0,
        dateRange: { startDate, endDate },
        exportedRows: csvData.length
      }
    })

  } catch (error) {
    console.error('Error in exportFinancialData:', error)
    throw error
  }
}
