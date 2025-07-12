// Test cart API with authentication
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCartAPI() {
  console.log('🛒 Testing Cart API...\n');

  try {
    // First, register a new user
    const testEmail = `carttest${Date.now()}@example.com`;
    console.log('1️⃣ Registering new user for cart testing...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        first_name: 'Cart',
        last_name: 'Test',
        email: testEmail,
        password: 'testpassword123',
        phone: '1234567890',
        address: '123 Test Street'
      });
      console.log('✅ User registered successfully');
    } catch (regError) {
      console.log('⚠️ Registration failed (user might exist):', regError.response?.data?.message);
    }

    // Now login to get a token
    console.log('\n2️⃣ Logging in to get authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'testpassword123'
    });
    
    const token = loginResponse.data.token;
    console.log(`✅ Login successful, token received: ${token ? 'Yes' : 'No'}`);
    
    if (!token) {
      console.log('❌ No token received, cannot test cart API');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 3: Get cart (should be empty initially)
    console.log('\n3️⃣ Testing GET /api/cart...');
    try {
      const cartResponse = await axios.get(`${BASE_URL}/cart`, { headers });
      console.log(`✅ Cart retrieved: ${cartResponse.status} - ${cartResponse.data.data.length} items`);
    } catch (cartError) {
      console.log(`❌ Cart GET failed: ${cartError.response?.status} - ${cartError.response?.data?.message || cartError.message}`);
      console.log('Full error:', cartError.response?.data);
    }

    // First, find a product with stock
    console.log('\n3.5️⃣ Finding a product with stock...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    const productWithStock = productsResponse.data.data.find(p => p.quantity > 0);

    if (productWithStock) {
      console.log(`✅ Found product with stock: ${productWithStock.name} (ID: ${productWithStock.id}, Stock: ${productWithStock.quantity})`);
    } else {
      console.log('❌ No products with stock found');
      return;
    }

    // Test 4: Add item to cart
    console.log('\n4️⃣ Testing POST /api/cart (add item)...');
    try {
      const addToCartResponse = await axios.post(`${BASE_URL}/cart`, {
        product_id: productWithStock.id,
        quantity: 1
      }, { headers });
      console.log(`✅ Item added to cart: ${addToCartResponse.status} - ${addToCartResponse.data.message}`);
    } catch (addError) {
      console.log(`❌ Add to cart failed: ${addError.response?.status} - ${addError.response?.data?.message || addError.message}`);
      console.log('Full error:', addError.response?.data);
    }

  } catch (error) {
    console.error('❌ Cart API Test Failed:', error.response?.data || error.message);
  }
}

// Run the test
testCartAPI();
