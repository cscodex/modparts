import api from './config';

// Get user's wishlist
export const getWishlist = async () => {
  console.log('=== GET WISHLIST API CALL ===');

  try {
    const response = await api.get('/wishlist');
    console.log('Wishlist fetched successfully:', response.data);

    if (response.data && response.data.success) {
      // Filter out null/invalid items from the API response
      const rawItems = response.data.data?.items || [];
      const safeItems = rawItems.filter(item =>
        item && item.id && item.products && item.products.name
      );

      return {
        ...response.data.data,
        items: safeItems,
        count: safeItems.length
      };
    } else {
      console.warn('Unexpected wishlist response format:', response.data);
      return { items: [], count: 0 };
    }
  } catch (error) {
    console.error('=== GET WISHLIST ERROR ===');
    console.error('Error fetching wishlist:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Return empty wishlist on error
    return { items: [], count: 0 };
  }
};

// Add item to wishlist
export const addToWishlist = async (productId) => {
  console.log('=== ADD TO WISHLIST API CALL ===');
  console.log('Product ID:', productId);

  try {
    const response = await api.post('/wishlist', {
      product_id: productId
    });
    console.log('Added to wishlist successfully:', response.data);
    
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to add to wishlist');
    }
  } catch (error) {
    console.error('=== ADD TO WISHLIST ERROR ===');
    console.error('Error adding to wishlist:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to add to wishlist');
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (productId) => {
  console.log('=== REMOVE FROM WISHLIST API CALL ===');
  console.log('Product ID:', productId);

  try {
    const response = await api.delete('/wishlist', {
      data: {
        product_id: productId
      }
    });
    console.log('Removed from wishlist successfully:', response.data);
    
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to remove from wishlist');
    }
  } catch (error) {
    console.error('=== REMOVE FROM WISHLIST ERROR ===');
    console.error('Error removing from wishlist:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to remove from wishlist');
  }
};

// Check if product is in wishlist
export const isInWishlist = async (productId) => {
  console.log('=== CHECK WISHLIST API CALL ===');
  console.log('Product ID:', productId);

  try {
    const wishlistData = await getWishlist();
    const isInList = (wishlistData.items || []).some(item =>
      item && item.product_id === productId
    );
    console.log('Product in wishlist:', isInList);
    return isInList;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

// Move item from wishlist to cart
export const moveToCart = async (productId, quantity = 1) => {
  console.log('=== MOVE TO CART API CALL ===');
  console.log('Product ID:', productId, 'Quantity:', quantity);

  try {
    // Import cart API functions
    const { addToCart } = await import('./cart');
    
    // First add to cart
    await addToCart(productId, quantity);
    
    // Then remove from wishlist
    await removeFromWishlist(productId);
    
    console.log('Successfully moved from wishlist to cart');
    return { success: true, message: 'Item moved to cart' };
  } catch (error) {
    console.error('Error moving to cart:', error);
    throw new Error(error.message || 'Failed to move item to cart');
  }
};
