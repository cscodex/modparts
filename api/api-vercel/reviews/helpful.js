// Review Helpfulness API Endpoint (Vercel Compatible)
// Handles voting on review helpfulness

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getHelpfulnessVotes(req, res)
        
      case 'POST':
        return await voteHelpfulness(req, res)
        
      case 'PUT':
        return await updateHelpfulnessVote(req, res)
        
      case 'DELETE':
        return await removeHelpfulnessVote(req, res)
        
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Review helpfulness API error:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

// Get helpfulness votes for a review
async function getHelpfulnessVotes(req, res) {
  try {
    const { review_id } = req.query
    
    if (!review_id) {
      return res.status(400).json({ message: 'Review ID is required' })
    }
    
    console.log(`👍 Fetching helpfulness votes for review ${review_id}`)
    
    // Get vote counts
    const { data: votes, error: votesError } = await supabase
      .from('review_helpfulness')
      .select('is_helpful')
      .eq('review_id', review_id)
    
    if (votesError) {
      console.error('Error fetching helpfulness votes:', votesError)
      throw votesError
    }
    
    const helpfulCount = votes?.filter(vote => vote.is_helpful).length || 0
    const notHelpfulCount = votes?.filter(vote => !vote.is_helpful).length || 0
    
    return res.status(200).json({
      success: true,
      data: {
        reviewId: parseInt(review_id),
        helpfulCount,
        notHelpfulCount,
        totalVotes: helpfulCount + notHelpfulCount
      }
    })

  } catch (error) {
    console.error('Error in getHelpfulnessVotes:', error)
    throw error
  }
}

// Vote on review helpfulness
async function voteHelpfulness(req, res) {
  try {
    const { review_id, is_helpful } = req.body
    
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization required' })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ message: 'Invalid authorization' })
    }
    
    console.log(`👍 User ${user.id} voting on review ${review_id}: ${is_helpful ? 'helpful' : 'not helpful'}`)
    
    // Validate required fields
    if (!review_id || typeof is_helpful !== 'boolean') {
      return res.status(400).json({ 
        message: 'Review ID and is_helpful (boolean) are required' 
      })
    }
    
    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('id', review_id)
      .single()
    
    if (reviewError || !review) {
      return res.status(404).json({ message: 'Review not found' })
    }
    
    // Check if user has already voted on this review
    const { data: existingVote } = await supabase
      .from('review_helpfulness')
      .select('id, is_helpful')
      .eq('user_id', user.id)
      .eq('review_id', review_id)
      .single()
    
    if (existingVote) {
      // Update existing vote if different
      if (existingVote.is_helpful !== is_helpful) {
        const { error: updateError } = await supabase
          .from('review_helpfulness')
          .update({ is_helpful })
          .eq('id', existingVote.id)
        
        if (updateError) {
          console.error('Error updating helpfulness vote:', updateError)
          throw updateError
        }
        
        console.log('✅ Helpfulness vote updated successfully')
        
        return res.status(200).json({
          success: true,
          message: 'Vote updated successfully',
          data: { reviewId: parseInt(review_id), isHelpful: is_helpful }
        })
      } else {
        return res.status(400).json({ 
          message: 'You have already voted this way on this review' 
        })
      }
    } else {
      // Create new vote
      const { data: vote, error: voteError } = await supabase
        .from('review_helpfulness')
        .insert([{
          review_id: parseInt(review_id),
          user_id: user.id,
          is_helpful
        }])
        .select()
        .single()
      
      if (voteError) {
        console.error('Error creating helpfulness vote:', voteError)
        throw voteError
      }
      
      console.log('✅ Helpfulness vote created successfully:', vote.id)
      
      return res.status(201).json({
        success: true,
        message: 'Vote recorded successfully',
        data: { reviewId: parseInt(review_id), isHelpful: is_helpful }
      })
    }

  } catch (error) {
    console.error('Error in voteHelpfulness:', error)
    throw error
  }
}

// Update helpfulness vote
async function updateHelpfulnessVote(req, res) {
  try {
    const { review_id, is_helpful } = req.body
    
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization required' })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ message: 'Invalid authorization' })
    }
    
    console.log(`👍 User ${user.id} updating vote on review ${review_id}`)
    
    // Validate required fields
    if (!review_id || typeof is_helpful !== 'boolean') {
      return res.status(400).json({ 
        message: 'Review ID and is_helpful (boolean) are required' 
      })
    }
    
    // Find existing vote
    const { data: existingVote } = await supabase
      .from('review_helpfulness')
      .select('id')
      .eq('user_id', user.id)
      .eq('review_id', review_id)
      .single()
    
    if (!existingVote) {
      return res.status(404).json({ message: 'Vote not found' })
    }
    
    // Update the vote
    const { error: updateError } = await supabase
      .from('review_helpfulness')
      .update({ is_helpful })
      .eq('id', existingVote.id)
    
    if (updateError) {
      console.error('Error updating helpfulness vote:', updateError)
      throw updateError
    }
    
    console.log('✅ Helpfulness vote updated successfully')
    
    return res.status(200).json({
      success: true,
      message: 'Vote updated successfully',
      data: { reviewId: parseInt(review_id), isHelpful: is_helpful }
    })

  } catch (error) {
    console.error('Error in updateHelpfulnessVote:', error)
    throw error
  }
}

// Remove helpfulness vote
async function removeHelpfulnessVote(req, res) {
  try {
    const { review_id } = req.query
    
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization required' })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ message: 'Invalid authorization' })
    }
    
    console.log(`🗑️ User ${user.id} removing vote on review ${review_id}`)
    
    if (!review_id) {
      return res.status(400).json({ message: 'Review ID is required' })
    }
    
    // Find and delete the vote
    const { error: deleteError } = await supabase
      .from('review_helpfulness')
      .delete()
      .eq('user_id', user.id)
      .eq('review_id', review_id)
    
    if (deleteError) {
      console.error('Error removing helpfulness vote:', deleteError)
      throw deleteError
    }
    
    console.log('✅ Helpfulness vote removed successfully')
    
    return res.status(200).json({
      success: true,
      message: 'Vote removed successfully'
    })

  } catch (error) {
    console.error('Error in removeHelpfulnessVote:', error)
    throw error
  }
}

// Get user's vote on a specific review
export async function getUserVote(req, res) {
  try {
    const { review_id } = req.query
    
    // Get user from authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization required' })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ message: 'Invalid authorization' })
    }
    
    if (!review_id) {
      return res.status(400).json({ message: 'Review ID is required' })
    }
    
    console.log(`👤 Getting user ${user.id} vote for review ${review_id}`)
    
    // Get user's vote
    const { data: vote, error: voteError } = await supabase
      .from('review_helpfulness')
      .select('is_helpful')
      .eq('user_id', user.id)
      .eq('review_id', review_id)
      .single()
    
    if (voteError && voteError.code !== 'PGRST116') {
      console.error('Error fetching user vote:', voteError)
      throw voteError
    }
    
    return res.status(200).json({
      success: true,
      data: {
        reviewId: parseInt(review_id),
        userVote: vote ? vote.is_helpful : null
      }
    })

  } catch (error) {
    console.error('Error in getUserVote:', error)
    throw error
  }
}
