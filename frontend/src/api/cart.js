import api from './config';

export const getCart = async () => {
  console.log('=== FRONTEND: GET CART REQUEST ===');

  try {
    console.log('Sending request to:', '/cart');
    const response = await api.get('/cart');
    console.log('Response data:', response.data);
    console.log('=== FRONTEND: GET CART RESPONSE SUCCESS ===');
    return response.data;
  } catch (error) {
    console.error('=== FRONTEND: GET CART ERROR ===');
    console.error('Error fetching cart:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('=== FRONTEND: GET CART ERROR END ===');

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to fetch cart');
  }
};

export const addToCart = async (productId, quantity = 1) => {
  console.log('=== FRONTEND: ADD TO CART REQUEST ===');
  console.log('Product ID:', productId);
  console.log('Quantity:', quantity);

  try {
    console.log('Sending request to:', '/cart');
    console.log('Request payload:', { product_id: productId, quantity: quantity });

    const response = await api.post('/cart', {
      product_id: productId,
      quantity: quantity
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('=== FRONTEND: ADD TO CART RESPONSE SUCCESS ===');

    return response.data;
  } catch (error) {
    console.error('=== FRONTEND: ADD TO CART ERROR ===');
    console.error('Error adding to cart:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('=== FRONTEND: ADD TO CART ERROR END ===');

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};

export const updateCartItem = async (id, quantity) => {
  console.log('=== FRONTEND: UPDATE CART ITEM REQUEST ===');
  console.log('Item ID:', id);
  console.log('New quantity:', quantity);

  try {
    console.log(`Trying update cart item endpoint: /cart/${id}`);
    const response = await api.put(`/cart/${id}`, {
      quantity: quantity
    });
    console.log(`Update cart item endpoint successful`);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== FRONTEND: UPDATE CART ITEM ERROR ===');
    console.error('Error updating cart item:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
};

export const removeFromCart = async (id) => {
  console.log('=== FRONTEND: REMOVE FROM CART REQUEST ===');
  console.log('Item ID:', id);

  try {
    console.log(`Trying remove from cart endpoint: /cart/${id}`);
    const response = await api.delete(`/cart/${id}`);
    console.log(`Remove from cart endpoint successful`);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== FRONTEND: REMOVE FROM CART ERROR ===');
    console.error('Error removing from cart:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
  }
};

export const clearCart = async () => {
  console.log('=== FRONTEND: CLEAR CART REQUEST ===');

  try {
    console.log(`Trying clear cart endpoint: /cart`);
    const response = await api.delete('/cart');
    console.log(`Clear cart endpoint successful`);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== FRONTEND: CLEAR CART ERROR ===');
    console.error('Error clearing cart:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};

export const importCart = async (cartItems) => {
  console.log('=== FRONTEND: IMPORT CART REQUEST ===');
  console.log('Cart items:', cartItems);

  try {
    // Use the new Node.js cart API with PUT method for import
    const response = await api.put('/cart', {
      items: cartItems,
      import_mode: 'import'
    });

    console.log('Import cart successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== FRONTEND: IMPORT CART ERROR ===');
    console.error('Error importing cart:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to import cart');
  }
};
