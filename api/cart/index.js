const { supabase, supabaseAdmin } = require('../../lib/supabase')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Simple file-based cart storage as fallback
// In production, this should be replaced with Redis or database session storage
const CART_STORAGE_FILE = path.join(process.cwd(), 'temp-cart-storage.json')

function loadCartStorage() {
  try {
    if (fs.existsSync(CART_STORAGE_FILE)) {
      const data = fs.readFileSync(CART_STORAGE_FILE, 'utf8')
      return new Map(JSON.parse(data))
    }
  } catch (error) {
    console.error('Error loading cart storage:', error)
  }
  return new Map()
}

function saveCartStorage(cartStorage) {
  try {
    const data = JSON.stringify(Array.from(cartStorage.entries()))
    fs.writeFileSync(CART_STORAGE_FILE, data, 'utf8')
  } catch (error) {
    console.error('Error saving cart storage:', error)
  }
}

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

  console.log('🔑 Cart API - User from JWT:', { id: user.id, email: user.email })

  try {
    if (req.method === 'GET') {
      // Get user's cart items
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      let finalCartItems = []

      if (error) {
        console.error('Error fetching cart from database:', error)
        console.log('🔧 Falling back to in-memory cart storage...')
      } else {
        // Manually fetch product details for each cart item from database
        const cartWithProducts = []
        for (const item of cartItems || []) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, description, condition_status, price, quantity, image_url, category_id')
            .eq('id', item.product_id)
            .single()

          if (!productError && product) {
            // Get category name
            const { data: category } = await supabase
              .from('categories')
              .select('name')
              .eq('id', product.category_id)
              .single()

            cartWithProducts.push({
              ...item,
              product: {
                ...product,
                category_name: category?.name || null
              }
            })
          }
        }
        finalCartItems = cartWithProducts
      }

      // Always check fallback storage and merge if needed
      const cartStorage = loadCartStorage()
      const userCartKey = `cart_${user.id}`
      console.log(`🔍 Looking for fallback cart with key: ${userCartKey}`)
      console.log(`🗂️ Available cart storage keys:`, Array.from(cartStorage.keys()))
      const fallbackCart = cartStorage.get(userCartKey) || []
      console.log(`📦 Fallback cart items found: ${fallbackCart.length}`)

      if (fallbackCart.length > 0) {
        console.log(`📦 Found ${fallbackCart.length} items in fallback storage`)
        // Merge fallback items with database items (avoid duplicates)
        const existingProductIds = new Set(finalCartItems.map(item => item.product_id || item.product?.id))
        const newFallbackItems = fallbackCart.filter(item => !existingProductIds.has(item.product_id || item.product?.id))
        finalCartItems = [...finalCartItems, ...newFallbackItems]
        console.log(`🔄 After merging: ${finalCartItems.length} total items`)
      }

      console.log(`✅ Returning ${finalCartItems.length} cart items`)
      res.status(200).json({
        message: 'Cart retrieved successfully',
        data: finalCartItems
      })

    } else if (req.method === 'POST') {
      // Add item to cart
      const { product_id, quantity = 1 } = req.body

      if (!product_id || quantity <= 0) {
        return res.status(400).json({ 
          message: 'Product ID and valid quantity are required' 
        })
      }

      // Check if user exists in database with retry mechanism
      let dbUser = null
      let userError = null

      for (let attempt = 1; attempt <= 3; attempt++) {
        const result = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        dbUser = result.data
        userError = result.error

        if (!userError && dbUser) {
          console.log(`✅ User found in database on attempt ${attempt}:`, { userId: user.id })
          break
        }

        console.log(`❌ User not found in database (attempt ${attempt}/3):`, { userId: user.id, error: userError })

        if (attempt < 3) {
          // Wait 100ms before retrying
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      if (userError || !dbUser) {
        console.log('❌ User not found in database after 3 attempts:', { userId: user.id, error: userError })
        return res.status(400).json({ message: 'User not found in database' })
      }

      // Check if product exists and has enough quantity
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, quantity')
        .eq('id', product_id)
        .single()

      if (productError || !product) {
        return res.status(404).json({ message: 'Product not found' })
      }

      if (product.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient product quantity' })
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .single()

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity

        if (product.quantity < newQuantity) {
          return res.status(400).json({ message: 'Insufficient product quantity' })
        }

        const { data: updatedItem, error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
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
      } else {
        // Create new cart item - workaround for foreign key constraint issue
        console.log('🔧 Attempting cart item creation with workaround...')

        // Since foreign key constraint is broken, we'll use a different approach
        // Store cart data in a simple JSON format in a separate table or use localStorage fallback

        // For now, let's create a simple cart storage without foreign key dependency
        const cartItem = {
          id: crypto.randomUUID(),
          user_id: user.id,
          product_id,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Try direct insert to cart_items table
        console.log('🔧 Attempting cart insert with data:', {
          user_id: user.id,
          product_id: product_id,
          quantity: quantity,
          user_id_type: typeof user.id,
          product_id_type: typeof product_id
        });

        // First, let's try to check if there's an existing cart item to update
        const { data: existingCartItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', product_id)
          .single();

        let newItem, error;

        if (existingCartItem) {
          // Update existing item
          console.log('🔄 Updating existing cart item...');
          const result = await supabase
            .from('cart_items')
            .update({ quantity: existingCartItem.quantity + quantity })
            .eq('id', existingCartItem.id)
            .select()
            .single();

          newItem = result.data;
          error = result.error;
        } else {
          // Insert new item
          console.log('➕ Inserting new cart item...');
          const result = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product_id,
              quantity: quantity
            })
            .select()
            .single();

          newItem = result.data;
          error = result.error;
        }

        if (error) {
          console.error('Error adding to cart via direct insert:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          console.error('Error code:', error.code)
          console.error('Error message:', error.message)

          // Return the actual error instead of using fallback
          return res.status(500).json({
            message: 'Failed to add item to cart',
            error: error.message,
            details: 'Please check database table structure and foreign key constraints'
          })

        }

        console.log('✅ Cart item created successfully via direct insert')
        res.status(201).json({
          message: 'Item added to cart successfully',
          data: newItem
        })
      }

    } else if (req.method === 'DELETE') {
      // Clear entire cart
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error clearing cart:', error)
        return res.status(500).json({ message: 'Failed to clear cart' })
      }

      res.status(200).json({
        message: 'Cart cleared successfully'
      })

    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Cart API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
