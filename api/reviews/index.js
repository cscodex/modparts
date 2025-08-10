const { supabase } = require('../../lib/supabase')

module.exports = async function handler(req, res) {
  // CORS is handled by dev-server middleware

  try {
    const { method, query, body } = req
    const { product_id, review_id, page = 1, limit = 10, sort = 'newest', status = 'all' } = query

    console.log(`📝 Reviews API called: ${method} with params:`, { product_id, review_id, page, limit, sort, status })

    switch (method) {
      case 'GET':
        if (product_id) {
          return await getProductReviews(req, res, product_id, page, limit, sort)
        } else if (review_id) {
          return await getReviewById(req, res, review_id)
        } else {
          return await getAllReviews(req, res, page, limit, status)
        }
        
      case 'POST':
        return await createReview(req, res, body)
        
      case 'PUT':
        if (review_id) {
          return await updateReview(req, res, review_id, body)
        } else {
          return res.status(400).json({ success: false, message: 'Review ID is required for updates' })
        }
        
      case 'DELETE':
        if (review_id) {
          return await deleteReview(req, res, review_id)
        } else {
          return res.status(400).json({ success: false, message: 'Review ID is required for deletion' })
        }
        
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('❌ Reviews API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

// Get reviews for a specific product
async function getProductReviews(req, res, productId, page, limit, sort) {
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    console.log(`📝 Fetching reviews for product ${productId}`)
    
    // Build sort order
    let orderColumn = 'created_at'
    let ascending = false
    
    switch (sort) {
      case 'oldest':
        orderColumn = 'created_at'
        ascending = true
        break
      case 'highest_rating':
        orderColumn = 'rating'
        ascending = false
        break
      case 'lowest_rating':
        orderColumn = 'rating'
        ascending = true
        break
      case 'most_helpful':
        orderColumn = 'helpful_count'
        ascending = false
        break
      default:
        orderColumn = 'created_at'
        ascending = false
    }
    
    // Get reviews with user information
    const { data: reviews, error: reviewsError, count } = await supabase
      .from('product_reviews')
      .select(`
        id,
        rating,
        review_title,
        review_text,
        is_verified_purchase,
        helpful_count,
        created_at,
        updated_at,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' })
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order(orderColumn, { ascending })
      .range(offset, offset + parseInt(limit) - 1)
    
    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError)
      throw reviewsError
    }
    
    // Get product rating statistics
    const { data: ratingStats, error: statsError } = await supabase
      .rpc('get_product_rating_stats', { product_id_param: parseInt(productId) })
    
    if (statsError) {
      console.error('❌ Error fetching rating stats:', statsError)
    }
    
    // Format reviews data
    const formattedReviews = reviews?.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.review_title,
      text: review.review_text,
      isVerifiedPurchase: review.is_verified_purchase,
      helpfulCount: review.helpful_count,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      user: {
        id: review.users?.id,
        name: `${review.users?.first_name || ''} ${review.users?.last_name || ''}`.trim() || 'Anonymous',
        email: review.users?.email
      }
    })) || []
    
    const stats = ratingStats?.[0] || {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    }
    
    return res.status(200).json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / parseInt(limit))
        },
        statistics: {
          averageRating: parseFloat(stats.average_rating),
          totalReviews: stats.total_reviews,
          ratingDistribution: stats.rating_distribution
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in getProductReviews:', error)
    throw error
  }
}

// Create a new review
async function createReview(req, res, body) {
  try {
    const { product_id, rating, review_title, review_text } = body
    
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization required' })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid authorization' })
    }
    
    console.log(`📝 Creating review for product ${product_id} by user ${user.id}`)
    
    // Validate required fields
    if (!product_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Product ID and valid rating (1-5) are required' 
      })
    }
    
    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this product' 
      })
    }
    
    // Check if user has purchased this product
    const { data: isVerified, error: verifyError } = await supabase
      .rpc('check_verified_purchase', { 
        user_id_param: user.id, 
        product_id_param: parseInt(product_id) 
      })
    
    const isVerifiedPurchase = !verifyError && isVerified
    
    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('product_reviews')
      .insert([{
        product_id: parseInt(product_id),
        user_id: user.id,
        rating: parseInt(rating),
        review_title: review_title || null,
        review_text: review_text || null,
        is_verified_purchase: isVerifiedPurchase
      }])
      .select(`
        id,
        rating,
        review_title,
        review_text,
        is_verified_purchase,
        helpful_count,
        created_at,
        users (
          first_name,
          last_name
        )
      `)
      .single()
    
    if (reviewError) {
      console.error('❌ Error creating review:', reviewError)
      throw reviewError
    }
    
    console.log('✅ Review created successfully:', review.id)
    
    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        id: review.id,
        rating: review.rating,
        title: review.review_title,
        text: review.review_text,
        isVerifiedPurchase: review.is_verified_purchase,
        helpfulCount: review.helpful_count,
        createdAt: review.created_at,
        user: {
          name: `${review.users?.first_name || ''} ${review.users?.last_name || ''}`.trim() || 'Anonymous'
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in createReview:', error)
    throw error
  }
}

// Update an existing review
async function updateReview(req, res, reviewId, body) {
  try {
    const { rating, review_title, review_text, is_approved } = body
    
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization required' })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid authorization' })
    }
    
    console.log(`📝 Updating review ${reviewId} by user ${user.id}`)
    
    // Check if user is admin or review owner
    const { data: userInfo } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const isAdmin = userInfo?.role === 'admin'
    
    // Get the review to check ownership
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single()
    
    if (!existingReview) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }
    
    const isOwner = existingReview.user_id === user.id
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' })
    }
    
    // Build update object
    const updateData = {}
    if (rating !== undefined && rating >= 1 && rating <= 5) {
      updateData.rating = parseInt(rating)
    }
    if (review_title !== undefined) {
      updateData.review_title = review_title
    }
    if (review_text !== undefined) {
      updateData.review_text = review_text
    }
    // Only admins can update approval status
    if (is_approved !== undefined && isAdmin) {
      updateData.is_approved = is_approved
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' })
    }
    
    // Update the review
    const { data: review, error: updateError } = await supabase
      .from('product_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select(`
        id,
        rating,
        review_title,
        review_text,
        is_verified_purchase,
        is_approved,
        helpful_count,
        created_at,
        updated_at
      `)
      .single()
    
    if (updateError) {
      console.error('❌ Error updating review:', updateError)
      throw updateError
    }
    
    console.log('✅ Review updated successfully:', review.id)
    
    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    })

  } catch (error) {
    console.error('❌ Error in updateReview:', error)
    throw error
  }
}

// Delete a review
async function deleteReview(req, res, reviewId) {
  try {
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization required' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid authorization' })
    }

    console.log(`🗑️ Deleting review ${reviewId} by user ${user.id}`)

    // Check if user is admin or review owner
    const { data: userInfo } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userInfo?.role === 'admin'

    // Get the review to check ownership
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single()

    if (!existingReview) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    const isOwner = existingReview.user_id === user.id

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' })
    }

    // Delete the review
    const { error: deleteError } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)

    if (deleteError) {
      console.error('❌ Error deleting review:', deleteError)
      throw deleteError
    }

    console.log('✅ Review deleted successfully:', reviewId)

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error in deleteReview:', error)
    throw error
  }
}

// Get all reviews (admin only)
async function getAllReviews(req, res, page, limit, status) {
  try {
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization required' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid authorization' })
    }

    // Check if user is admin
    const { data: userInfo } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userInfo?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = supabase
      .from('product_reviews')
      .select(`
        id,
        product_id,
        rating,
        review_title,
        review_text,
        is_verified_purchase,
        is_approved,
        helpful_count,
        created_at,
        updated_at,
        users (
          first_name,
          last_name,
          email
        ),
        products (
          name
        )
      `, { count: 'exact' })

    // Filter by approval status
    if (status === 'pending') {
      query = query.eq('is_approved', false)
    } else if (status === 'approved') {
      query = query.eq('is_approved', true)
    }

    const { data: reviews, error: reviewsError, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1)

    if (reviewsError) {
      console.error('❌ Error fetching all reviews:', reviewsError)
      throw reviewsError
    }

    return res.status(200).json({
      success: true,
      data: {
        reviews: reviews || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / parseInt(limit))
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in getAllReviews:', error)
    throw error
  }
}

// Get single review by ID
async function getReviewById(req, res, reviewId) {
  try {
    const { data: review, error } = await supabase
      .from('product_reviews')
      .select(`
        id,
        product_id,
        rating,
        review_title,
        review_text,
        is_verified_purchase,
        is_approved,
        helpful_count,
        created_at,
        updated_at,
        users (
          first_name,
          last_name,
          email
        ),
        products (
          name
        )
      `)
      .eq('id', reviewId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Review not found' })
      }
      throw error
    }

    return res.status(200).json({
      success: true,
      data: review
    })

  } catch (error) {
    console.error('❌ Error in getReviewById:', error)
    throw error
  }
}
