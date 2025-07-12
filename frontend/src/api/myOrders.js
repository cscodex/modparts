import api from './config';

// Create a simple function to fetch orders
export const fetchMyOrders = async () => {
  console.log('=== FETCHING MY ORDERS ===');

  try {
    const response = await api.get('/orders');
    console.log('Orders fetched successfully:', response.data);

    if (response.data && response.data.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching orders:', error);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    // Return empty array on error
    return [];
  }
};

// Function to create a test order if none exist
export const createTestOrder = async () => {
  console.log('=== CREATING TEST ORDER ===');

  try {
    const response = await axios.get(`${API_URL}/my_orders.php?create_test=true&v=${API_VERSION}`, {
      withCredentials: true
    });

    console.log('Test order created successfully:', response.data);
    return response.data.records || [];
  } catch (error) {
    console.error('Error creating test order:', error);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    // Return empty array on error
    return [];
  }
};

// Function to get a single order by ID
export const fetchOrderById = async (orderId) => {
  console.log('=== FETCHING ORDER BY ID ===', orderId);

  try {
    const response = await axios.get(`${API_URL}/my_orders.php?id=${orderId}&v=${API_VERSION}`, {
      withCredentials: true
    });

    console.log('Order fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    // Return null on error
    return null;
  }
};
