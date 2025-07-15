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
    // Use the working Node.js admin orders endpoint
    console.log('Fetching all orders from admin endpoint: /admin/orders');
    const response = await api.get('/admin/orders');
    console.log('All orders fetched successfully:', response.data);

    // Return the orders data
    if (response.data && response.data.success) {
      return response.data.data || [];
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('=== GET ALL ORDERS API CALL ERROR ===');
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
    // Use the working Node.js admin orders endpoint
    console.log('Updating order status via admin endpoint: /admin/orders');
    const response = await api.put('/admin/orders', { id, status });
    console.log('Order status updated successfully:', response.data);

    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to update order status');
    }
  } catch (error) {
    console.error('=== UPDATE ORDER STATUS API CALL ERROR ===');
    console.error('Error updating order status:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);

    // Throw the error to be handled by the caller
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

export const exportOrders = async () => {
  console.log('=== EXPORT ORDERS API CALL ===');

  try {
    // Get all orders first
    const orders = await getAllOrders();

    if (!orders || orders.length === 0) {
      console.warn('No orders to export');
      return;
    }

    // Create CSV content
    const csvHeaders = ['Order ID', 'Total Amount', 'Status', 'Shipping Address', 'Payment Method', 'Created At', 'Customer Email', 'Customer Name'];
    const csvRows = orders.map(order => [
      order.id || '',
      order.total_amount || '0.00',
      order.status || '',
      order.shipping_address || '',
      order.payment_method || '',
      order.created_at || '',
      order.user?.email || order.email || '',
      `${order.user?.first_name || order.first_name || ''} ${order.user?.last_name || order.last_name || ''}`.trim()
    ]);

    // Convert to CSV string
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Orders exported successfully');
  } catch (error) {
    console.error('=== EXPORT ORDERS ERROR ===');
    console.error('Error exporting orders:', error);
    throw new Error('Failed to export orders');
  }
};
