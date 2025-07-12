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

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      // Get all categories
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        return res.status(500).json({ message: 'Failed to fetch categories' })
      }

      res.status(200).json({
        message: 'Categories retrieved successfully',
        data: categories
      })

    } else if (req.method === 'POST') {
      // Create new category (admin only)
      const { name, description } = req.body

      if (!name) {
        return res.status(400).json({ message: 'Category name is required' })
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert([{ name, description: description || null }])
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        return res.status(500).json({ message: 'Failed to create category' })
      }

      res.status(201).json({
        message: 'Category created successfully',
        data: category
      })

    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Categories API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
