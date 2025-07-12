// Test the specific endpoints the user reported issues with
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Testing Specific Endpoints...\n');

  try {
    // Test 1: Product detail endpoint
    console.log('1️⃣ Testing GET /api/products/88...');
    try {
      const productResponse = await axios.get(`${BASE_URL}/products/88`);
      console.log(`✅ Product 88: ${productResponse.status} - ${productResponse.data.data.name}`);
      console.log(`   Price: $${productResponse.data.data.price}, Stock: ${productResponse.data.data.quantity}`);
    } catch (productError) {
      console.log(`❌ Product 88 failed: ${productError.response?.status} - ${productError.response?.data?.message || productError.message}`);
    }

    // Test 2: Another product
    console.log('\n2️⃣ Testing GET /api/products/25...');
    try {
      const product25Response = await axios.get(`${BASE_URL}/products/25`);
      console.log(`✅ Product 25: ${product25Response.status} - ${product25Response.data.data.name}`);
      console.log(`   Price: $${product25Response.data.data.price}, Stock: ${product25Response.data.data.quantity}`);
    } catch (product25Error) {
      console.log(`❌ Product 25 failed: ${product25Error.response?.status} - ${product25Error.response?.data?.message || product25Error.message}`);
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

// Run the test
testEndpoints();
