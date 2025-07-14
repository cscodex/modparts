const { supabase } = require('../../lib/supabase')

module.exports = async function handler(req, res) {
  console.log('🔍 Categories API called')
  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)

  // CORS is handled by dev-server middleware

  try {
    if (req.method === 'GET') {
      // Get all categories
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching categories:', error)
        return res.status(500).json({ message: 'Failed to fetch categories' })
      }

      console.log('✅ Categories fetched successfully:', categories.length, 'categories')
      console.log('📋 Categories:', categories.map(c => ({ id: c.id, name: c.name })))

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
        .insert([
          {
            name,
            description: description || null
          }
        ])
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
