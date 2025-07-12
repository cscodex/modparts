const { supabase } = require('../../lib/supabase')

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

  try {
    if (req.method === 'GET') {
      // Get all products with category information
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        return res.status(500).json({ message: 'Failed to fetch products' })
      }

      res.status(200).json({
        message: 'Products retrieved successfully',
        data: products
      })

    } else if (req.method === 'POST') {
      // Create new product (admin only)
      const { name, description, condition_status, price, quantity, category_id, image_url } = req.body

      if (!name || !condition_status || !price || price < 0 || quantity < 0) {
        return res.status(400).json({ 
          message: 'Name, condition status, valid price, and quantity are required' 
        })
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert([
          {
            name,
            description: description || null,
            condition_status,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            category_id: category_id || null,
            image_url: image_url || null
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({ message: 'Failed to create product' })
      }

      res.status(201).json({
        message: 'Product created successfully',
        data: product
      })

    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Products API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
