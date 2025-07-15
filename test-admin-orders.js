// Test script to verify admin orders API endpoint is working
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAdminOrders() {
  console.log('🧪 Testing Admin Orders API Endpoint...\n');

  try {
    // Test the admin orders endpoint
    console.log('1️⃣ Testing GET /api/admin/orders...');
    
    // Note: This will fail without proper authentication, but we can check if the endpoint exists
    try {
      const response = await axios.get(`${BASE_URL}/admin/orders`);
      console.log(`✅ Admin Orders: ${response.status} - Found ${response.data.data?.length || 0} orders`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.log(`✅ Admin Orders: Endpoint exists (401 Unauthorized - expected without token)`);
      } else if (status === 403) {
        console.log(`✅ Admin Orders: Endpoint exists (403 Forbidden - expected without admin role)`);
      } else if (status === 404) {
        console.log(`❌ Admin Orders: Endpoint not found (404)`);
      } else {
        console.log(`⚠️ Admin Orders: Unexpected status ${status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test update order status endpoint
    console.log('\n2️⃣ Testing PUT /api/admin/orders...');
    try {
      const response = await axios.put(`${BASE_URL}/admin/orders`, {
        id: 1,
        status: 'processing'
      });
      console.log(`✅ Update Order Status: ${response.status} - Success`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.log(`✅ Update Order Status: Endpoint exists (401 Unauthorized - expected without token)`);
      } else if (status === 403) {
        console.log(`✅ Update Order Status: Endpoint exists (403 Forbidden - expected without admin role)`);
      } else if (status === 400) {
        console.log(`✅ Update Order Status: Endpoint exists (400 Bad Request - expected with invalid data)`);
      } else if (status === 404) {
        console.log(`❌ Update Order Status: Endpoint not found (404)`);
      } else {
        console.log(`⚠️ Update Order Status: Unexpected status ${status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test the old problematic endpoints to confirm they're not being used
    console.log('\n3️⃣ Testing old problematic endpoints (should fail)...');
    
    const oldEndpoints = [
      '/controllers/admin/all_orders.php',
      '/admin/all_orders.php',
      '/orders/read.php'
    ];

    for (const endpoint of oldEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        console.log(`⚠️ ${endpoint}: Unexpectedly working (${response.status})`);
      } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
          console.log(`✅ ${endpoint}: Correctly returns 404 (not found)`);
        } else {
          console.log(`⚠️ ${endpoint}: Status ${status} - ${error.response?.data?.message || error.message}`);
        }
      }
    }

    console.log('\n🎉 Admin Orders API Test Complete!');
    console.log('\n📋 Summary:');
    console.log('- Admin orders endpoint should be accessible at /api/admin/orders');
    console.log('- Update order status should work via PUT /api/admin/orders');
    console.log('- Old PHP endpoints should return 404 (not found)');
    console.log('- Frontend should now use the working Node.js endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminOrders();
