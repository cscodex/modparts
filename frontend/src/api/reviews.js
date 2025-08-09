// Product Reviews API Service
// Frontend service for managing product reviews and ratings

import { API_URL } from './config';

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Base API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Get reviews for a specific product
export const getProductReviews = async (productId, options = {}) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = options;
    
    console.log(`📝 Fetching reviews for product ${productId}`);
    
    const queryParams = new URLSearchParams({
      product_id: productId,
      page: page.toString(),
      limit: limit.toString(),
      sort
    });
    
    const response = await apiRequest(`/reviews?${queryParams}`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch product reviews');
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

// Create a new review
export const createReview = async (reviewData) => {
  try {
    const { productId, rating, title, text } = reviewData;
    
    console.log(`📝 Creating review for product ${productId}`);
    
    if (!productId || !rating || rating < 1 || rating > 5) {
      throw new Error('Product ID and valid rating (1-5) are required');
    }
    
    const response = await apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        rating: parseInt(rating),
        review_title: title || null,
        review_text: text || null
      })
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create review');
    }
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const { rating, title, text } = reviewData;
    
    console.log(`📝 Updating review ${reviewId}`);
    
    const updateData = {};
    if (rating !== undefined && rating >= 1 && rating <= 5) {
      updateData.rating = parseInt(rating);
    }
    if (title !== undefined) {
      updateData.review_title = title;
    }
    if (text !== undefined) {
      updateData.review_text = text;
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const response = await apiRequest(`/reviews?review_id=${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update review');
    }
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    console.log(`🗑️ Deleting review ${reviewId}`);
    
    const response = await apiRequest(`/reviews?review_id=${reviewId}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      return true;
    } else {
      throw new Error(response.message || 'Failed to delete review');
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Vote on review helpfulness
export const voteReviewHelpfulness = async (reviewId, isHelpful) => {
  try {
    console.log(`👍 Voting on review ${reviewId}: ${isHelpful ? 'helpful' : 'not helpful'}`);
    
    const response = await apiRequest('/reviews/helpful', {
      method: 'POST',
      body: JSON.stringify({
        review_id: reviewId,
        is_helpful: isHelpful
      })
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to vote on review helpfulness');
    }
  } catch (error) {
    console.error('Error voting on review helpfulness:', error);
    throw error;
  }
};

// Get helpfulness votes for a review
export const getReviewHelpfulness = async (reviewId) => {
  try {
    console.log(`👍 Fetching helpfulness votes for review ${reviewId}`);
    
    const response = await apiRequest(`/reviews/helpful?review_id=${reviewId}`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch review helpfulness');
    }
  } catch (error) {
    console.error('Error fetching review helpfulness:', error);
    throw error;
  }
};

// Remove helpfulness vote
export const removeHelpfulnessVote = async (reviewId) => {
  try {
    console.log(`🗑️ Removing helpfulness vote for review ${reviewId}`);
    
    const response = await apiRequest(`/reviews/helpful?review_id=${reviewId}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      return true;
    } else {
      throw new Error(response.message || 'Failed to remove helpfulness vote');
    }
  } catch (error) {
    console.error('Error removing helpfulness vote:', error);
    throw error;
  }
};

// Get user's vote on a specific review
export const getUserReviewVote = async (reviewId) => {
  try {
    console.log(`👤 Getting user vote for review ${reviewId}`);
    
    const response = await apiRequest(`/reviews/helpful/user?review_id=${reviewId}`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get user vote');
    }
  } catch (error) {
    console.error('Error getting user vote:', error);
    throw error;
  }
};

// Get all reviews (admin only)
export const getAllReviews = async (options = {}) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = options;
    
    console.log(`📝 Fetching all reviews (admin)`);
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status
    });
    
    const response = await apiRequest(`/reviews?${queryParams}`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch all reviews');
    }
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw error;
  }
};

// Moderate review (admin only)
export const moderateReview = async (reviewId, isApproved) => {
  try {
    console.log(`🛡️ Moderating review ${reviewId}: ${isApproved ? 'approved' : 'rejected'}`);
    
    const response = await apiRequest(`/reviews?review_id=${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({
        is_approved: isApproved
      })
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to moderate review');
    }
  } catch (error) {
    console.error('Error moderating review:', error);
    throw error;
  }
};

// Utility functions for review data
export const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatReviewDate(dateString);
  }
};

export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
};

export const getRatingDistribution = (reviews) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  if (!reviews || reviews.length === 0) return distribution;
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++;
    }
  });
  
  return distribution;
};

export const validateReviewData = (reviewData) => {
  const { productId, rating, title, text } = reviewData;
  const errors = [];
  
  if (!productId) {
    errors.push('Product ID is required');
  }
  
  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }
  
  if (title && title.length > 255) {
    errors.push('Review title must be 255 characters or less');
  }
  
  if (text && text.length > 5000) {
    errors.push('Review text must be 5000 characters or less');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
