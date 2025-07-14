// Test script to verify order creation fix
const axios = require('axios');

// Test data that mimics what the frontend sends
const testOrderData = {
  items: [
    {
      product_id: 1,
      quantity: 2,
      price: 25.99
    }
  ],
  total_amount: 51.98,
  shipping_address: "John Doe, 123 Main St, City, State 12345, Phone: 555-1234",
  payment_method: "cash_on_delivery",
  payment_status: "pending",
  transaction_id: null,
  reference_number: null,
  order_number: null,
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  city: "City",
  state: "State",
  zip_code: "12345",
  phone: "555-1234"
};

async function testOrderCreation() {
  try {
    console.log('Testing order creation...');
    console.log('Test data:', JSON.stringify(testOrderData, null, 2));
    
    // You'll need to replace this with a valid token
    const token = 'your-test-token-here';
    
    const response = await axios.post('http://localhost:3000/api/orders', testOrderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order creation successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Check if the response has the expected structure
    if (response.data.order_id) {
      console.log('✅ Response includes order_id:', response.data.order_id);
    } else {
      console.log('❌ Response missing order_id');
    }
    
  } catch (error) {
    console.error('❌ Order creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

// Run the test
testOrderCreation();
