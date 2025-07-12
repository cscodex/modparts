import api from './config';
import { fetchMyOrders, fetchOrderById } from './myOrders';

export const createOrder = async (orderData) => {
  console.log('=== CREATE ORDER API CALL ===');
  console.log('Order data:', orderData);

  try {
    console.log('Sending request to: /orders');
    const response = await api.post('/orders', orderData);
    console.log('Order creation response:', response.data);
    console.log('=== CREATE ORDER API CALL SUCCESS ===');
    return response.data;
  } catch (error) {
    console.error('=== CREATE ORDER API CALL ERROR ===');
    console.error('Error creating order:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

// Wrapper function that uses the new API
export const getUserOrders = async () => {
  console.log('=== GET USER ORDERS API CALL (WRAPPER) ===');
  return fetchMyOrders();
};

// Wrapper function that uses the new API
export const getOrderById = async (id) => {
  console.log('=== GET ORDER BY ID API CALL (WRAPPER) ===');
  console.log('Order ID:', id);
  return fetchOrderById(id);
};

export const getAllOrders = async () => {
  console.log('=== GET ALL ORDERS API CALL ===');

  try {
    // Try multiple endpoint paths to ensure one works
    const endpointPaths = [
      '/controllers/admin/all_orders.php',
      '/admin/all_orders.php',
      '/orders/read.php'
    ];

    let lastError = null;

    // Try each endpoint path
    for (const path of endpointPaths) {
      try {
        console.log(`Trying all orders endpoint: ${path}`);
        const response = await api.get(path);
        console.log(`All orders endpoint successful: ${path}`);
        console.log('Response data:', response.data);
        return response.data.records || [];
      } catch (error) {
        console.error(`All orders endpoint failed: ${path}`, error);
        lastError = error;
        // Continue to the next endpoint
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All order endpoints failed');
  } catch (error) {
    console.error('=== GET ALL ORDERS API CALL ERROR (ALL ATTEMPTS) ===');
    console.error('Error fetching all orders:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Return empty array for error case
    return [];
  }
};

export const updateOrderStatus = async (id, status) => {
  console.log('=== UPDATE ORDER STATUS API CALL ===');
  console.log('Order ID:', id);
  console.log('New status:', status);

  try {
    // Try multiple endpoint paths to ensure one works
    const endpointPaths = [
      '/controllers/orders/update_status.php',
      '/orders/update_status.php'
    ];

    let lastError = null;

    // Try each endpoint path
    for (const path of endpointPaths) {
      try {
        console.log(`Trying update status endpoint: ${path}`);
        const response = await api.put(path, { id, status });
        console.log(`Update status endpoint successful: ${path}`);
        console.log('Response data:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Update status endpoint failed: ${path}`, error);
        lastError = error;
        // Continue to the next endpoint
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All update status endpoints failed');
  } catch (error) {
    console.error('=== UPDATE ORDER STATUS API CALL ERROR (ALL ATTEMPTS) ===');
    console.error('Error updating order status:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

export const exportOrders = () => {
  window.open(`${api.defaults.baseURL}/controllers/orders/export.php`, '_blank');
};
