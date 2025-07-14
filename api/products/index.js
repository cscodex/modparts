const { supabase } = require('../../lib/supabase')

module.exports = async function handler(req, res) {
  // CORS is handled by dev-server middleware

  try {
    if (req.method === 'GET') {
      // Get pagination parameters from query
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12; // Default 12 products per page
      const search = req.query.search || '';
      const category = req.query.category || '';
      const categories = req.query.categories || ''; // Multiple categories comma-separated
      const sortBy = req.query.sortBy || 'created_at';
      const sortOrder = req.query.sortOrder === 'asc' ? true : false;

      console.log('🔍 Products API called with filters:', {
        page, limit, search, category, categories, sortBy, sortOrder
      });

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `, { count: 'exact' });

      // Add search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Add category filter (single category for backward compatibility)
      if (category) {
        query = query.eq('category_id', category);
      }

      // Add multiple categories filter
      if (categories) {
        const categoryIds = categories.split(',').map(id => id.trim()).filter(id => id);
        if (categoryIds.length > 0) {
          console.log('🔍 Filtering by categories:', categoryIds);
          query = query.in('category_id', categoryIds);
        }
      }

      // Add sorting
      query = query.order(sortBy, { ascending: sortOrder });

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      const { data: products, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error)
        return res.status(500).json({ message: 'Failed to fetch products' })
      }

      // Calculate pagination info
      const totalPages = Math.ceil(count / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        message: 'Products retrieved successfully',
        data: products,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search,
          category,
          sortBy,
          sortOrder: sortOrder ? 'asc' : 'desc'
        }
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
