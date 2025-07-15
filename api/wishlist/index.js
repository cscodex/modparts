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
  // CORS is handled by dev-server middleware

  // Verify authentication
  const user = verifyToken(req)
  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    })
  }

  try {
    if (req.method === 'GET') {
      // Get user's wishlist
      console.log('💝 Fetching wishlist for user:', user.id)
      
      const { data: wishlistItems, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            description,
            price,
            quantity,
            image_url,
            condition_status,
            categories (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching wishlist:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch wishlist',
          error: error.message
        })
      }

      console.log(`✅ Successfully fetched ${wishlistItems.length} wishlist items`)
      
      return res.status(200).json({
        success: true,
        data: {
          items: wishlistItems,
          count: wishlistItems.length
        }
      })

    } else if (req.method === 'POST') {
      // Add item to wishlist
      const { product_id } = req.body

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        })
      }

      console.log('💝 Adding product to wishlist:', { user_id: user.id, product_id })

      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', product_id)
        .single()

      if (productError || !product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        })
      }

      // Check if item is already in wishlist
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .single()

      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Product is already in your wishlist'
        })
      }

      // Add to wishlist
      const { data: wishlistItem, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: product_id
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding to wishlist:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to add item to wishlist',
          error: error.message
        })
      }

      console.log('✅ Successfully added to wishlist:', wishlistItem.id)

      return res.status(201).json({
        success: true,
        message: 'Product added to wishlist',
        data: wishlistItem
      })

    } else if (req.method === 'DELETE') {
      // Remove item from wishlist
      const { product_id } = req.body

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        })
      }

      console.log('💝 Removing product from wishlist:', { user_id: user.id, product_id })

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product_id)

      if (error) {
        console.error('Error removing from wishlist:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to remove item from wishlist',
          error: error.message
        })
      }

      console.log('✅ Successfully removed from wishlist')

      return res.status(200).json({
        success: true,
        message: 'Product removed from wishlist'
      })

    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      })
    }

  } catch (error) {
    console.error('Wishlist API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}
