// Test script to verify cart import functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCartImport() {
  console.log('🧪 Testing Cart Import Functionality...\n');

  try {
    // Test 1: Check if cart endpoint exists
    console.log('1️⃣ Testing cart endpoint availability...');
    
    try {
      const response = await axios.get(`${BASE_URL}/cart`);
      console.log(`❌ Unexpected success - should require authentication`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.log(`✅ Cart endpoint exists and requires authentication (401)`);
      } else {
        console.log(`❌ Unexpected error: ${status}`);
      }
    }

    // Test 2: Test cart import with authentication
    console.log('\n2️⃣ Testing authenticated cart import...');
    
    try {
      const jwt = require('jsonwebtoken');
      const mockToken = jwt.sign(
        { id: 1, email: 'test@example.com' }, 
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );

      // Mock cart items to import
      const mockCartItems = [
        { product_id: 1, quantity: 2 },
        { product_id: 2, quantity: 1 }
      ];

      const response = await axios.put(`${BASE_URL}/cart`, {
        items: mockCartItems,
        import_mode: 'import'
      }, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Cart import successful:`, response.data);
      
      if (response.data.success_count !== undefined) {
        console.log(`✅ Import completed: ${response.data.success_count} success, ${response.data.error_count} errors`);
      }
      
    } catch (authError) {
      const status = authError.response?.status;
      const data = authError.response?.data;
      
      if (status === 400 && data?.message?.includes('Invalid import request')) {
        console.log(`❌ Import request format issue:`, data.message);
      } else if (status === 500) {
        console.log(`❌ Server error during import:`, data?.message);
      } else {
        console.log(`❌ Cart import failed (${status}):`, data);
      }
    }

    console.log('\n🎯 Expected Behavior:');
    console.log('- Cart import endpoint should require authentication');
    console.log('- PUT /api/cart with import_mode should work');
    console.log('- Should clear existing cart and import new items');
    console.log('- Should validate products exist before importing');
    console.log('- Should return success/error counts');

    console.log('\n📋 Frontend Integration:');
    console.log('- Login should trigger cart import from localStorage');
    console.log('- No more 404 errors for PHP endpoints');
    console.log('- Cart items should sync properly between localStorage and database');
    console.log('- Import should happen seamlessly in background');

    console.log('\n🔧 What Was Fixed:');
    console.log('- Replaced PHP endpoints with Node.js API');
    console.log('- Added PUT method to cart API for import');
    console.log('- Proper error handling and validation');
    console.log('- Stock checking during import');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCartImport();
