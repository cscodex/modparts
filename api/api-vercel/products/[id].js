const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' })
  }

  try {
    if (req.method === 'GET') {
      // Get single product with category information
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          condition_status,
          price,
          quantity,
          image_url,
          created_at,
          updated_at,
          category_id,
          categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Product not found' })
        }
        return res.status(500).json({ message: 'Failed to fetch product' })
      }

      // Format the response to match frontend expectations
      const formattedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        condition_status: product.condition_status,
        price: product.price,
        quantity: product.quantity,
        image_url: product.image_url,
        category_id: product.category_id,
        category_name: product.categories?.name || null,
        created_at: product.created_at,
        updated_at: product.updated_at
      }

      return res.status(200).json({
        message: 'Product retrieved successfully',
        data: formattedProduct
      })

    } else if (req.method === 'PUT') {
      // Update product (admin only)
      const { name, description, condition_status, price, quantity, category_id, image_url } = req.body

      if (!name || !condition_status || price < 0 || quantity < 0) {
        return res.status(400).json({ 
          message: 'Name, condition status, valid price, and quantity are required' 
        })
      }

      const { data: product, error } = await supabase
        .from('products')
        .update({
          name,
          description: description || null,
          condition_status,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          category_id: category_id ? parseInt(category_id) : null,
          image_url: image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Product not found' })
        }
        return res.status(500).json({ message: 'Failed to update product' })
      }

      return res.status(200).json({
        message: 'Product updated successfully',
        data: product
      })

    } else if (req.method === 'DELETE') {
      // Delete product (admin only)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
        return res.status(500).json({ message: 'Failed to delete product' })
      }

      return res.status(200).json({
        message: 'Product deleted successfully'
      })

    } else {
      return res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Product API error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
