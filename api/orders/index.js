const { supabase } = require('../../lib/supabase')
const jwt = require('jsonwebtoken')

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
  } catch (error) {
    return null
  }
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Verify authentication
  const user = verifyToken(req)
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    if (req.method === 'GET') {
      // Get orders - simplified query to avoid foreign key relationship issues
      console.log('🔍 Fetching orders for user:', user.id)

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      // If not admin, only show user's own orders
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id)
      }

      const { data: orders, error } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        return res.status(500).json({ message: 'Failed to fetch orders' })
      }

      // For each order, fetch user and order items separately to avoid join issues
      const enrichedOrders = []

      for (const order of orders || []) {
        try {
          // Get user details separately
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .eq('id', order.user_id)
            .single()

          // Get order items separately
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id)

          // For each order item, get product details
          const enrichedItems = []
          for (const item of orderItems || []) {
            const { data: product } = await supabase
              .from('products')
              .select('id, name, image_url')
              .eq('id', item.product_id)
              .single()

            enrichedItems.push({
              ...item,
              product: product || null
            })
          }

          enrichedOrders.push({
            ...order,
            user: userData || null,
            order_items: enrichedItems
          })
        } catch (itemError) {
          console.error('Error enriching order:', itemError)
          // Include order even if enrichment fails
          enrichedOrders.push({
            ...order,
            user: null,
            order_items: []
          })
        }
      }

      console.log(`✅ Successfully fetched ${enrichedOrders.length} orders`)
      res.status(200).json({
        message: 'Orders retrieved successfully',
        data: enrichedOrders
      })

    } else if (req.method === 'POST') {
      // Create new order
      const { shipping_address, payment_method, items } = req.body

      if (!shipping_address || !payment_method || !items || items.length === 0) {
        return res.status(400).json({ 
          message: 'Shipping address, payment method, and items are required' 
        })
      }

      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: 0, // Will be calculated
            status: 'pending',
            shipping_address,
            payment_method
          }
        ])
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        return res.status(500).json({ message: 'Failed to create order' })
      }

      // Add order items and calculate total
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        // Get current product price and check availability
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, price, quantity')
          .eq('id', item.product_id)
          .single()

        if (productError || !product) {
          // Rollback by deleting the order
          await supabase.from('orders').delete().eq('id', order.id)
          return res.status(404).json({ 
            message: `Product with ID ${item.product_id} not found` 
          })
        }

        if (product.quantity < item.quantity) {
          // Rollback by deleting the order
          await supabase.from('orders').delete().eq('id', order.id)
          return res.status(400).json({ 
            message: `Insufficient quantity for product ID ${item.product_id}` 
          })
        }

        const itemTotal = product.price * item.quantity
        totalAmount += itemTotal

        orderItems.push({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        })

        // Update product quantity
        await supabase
          .from('products')
          .update({ quantity: product.quantity - item.quantity })
          .eq('id', item.product_id)
      }

      // Insert order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Rollback by deleting the order
        await supabase.from('orders').delete().eq('id', order.id)
        return res.status(500).json({ message: 'Failed to create order items' })
      }

      // Update order total
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ total_amount: totalAmount })
        .eq('id', order.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating order total:', updateError)
        return res.status(500).json({ message: 'Failed to update order total' })
      }

      // Clear user's cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      res.status(201).json({
        message: 'Order created successfully',
        data: updatedOrder
      })

    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Orders API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
