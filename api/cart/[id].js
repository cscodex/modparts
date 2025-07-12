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

  const { id } = req.query

  try {
    if (req.method === 'PUT') {
      // Update cart item quantity
      const { quantity } = req.body

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Valid quantity is required' })
      }

      // Verify the cart item belongs to the user
      const { data: cartItem, error: cartError } = await supabase
        .from('cart_items')
        .select('*, products(quantity)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (cartError || !cartItem) {
        return res.status(404).json({ message: 'Cart item not found' })
      }

      // Check if product has enough quantity
      if (cartItem.products.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient product quantity' })
      }

      // Update the cart item
      const { data: updatedItem, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating cart item:', error)
        return res.status(500).json({ message: 'Failed to update cart item' })
      }

      res.status(200).json({
        message: 'Cart item updated successfully',
        data: updatedItem
      })

    } else if (req.method === 'DELETE') {
      // Remove item from cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error removing cart item:', error)
        return res.status(500).json({ message: 'Failed to remove cart item' })
      }

      res.status(200).json({
        message: 'Cart item removed successfully'
      })

    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Cart item API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
