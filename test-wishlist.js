// Test script to verify wishlist functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testWishlistFeature() {
  console.log('🧪 Testing Wishlist Feature...\n');

  try {
    // Test the wishlist endpoint without authentication
    console.log('1️⃣ Testing GET /api/wishlist without authentication...');
    
    try {
      const response = await axios.get(`${BASE_URL}/wishlist`);
      console.log(`❌ Unexpected success - should require authentication`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.log(`✅ Correctly requires authentication (401)`);
      } else {
        console.log(`❌ Unexpected error status: ${status}`);
      }
    }

    // Test POST without authentication
    console.log('\n2️⃣ Testing POST /api/wishlist without authentication...');
    
    try {
      const response = await axios.post(`${BASE_URL}/wishlist`, {
        product_id: 1
      });
      console.log(`❌ Unexpected success - should require authentication`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.log(`✅ Correctly requires authentication (401)`);
      } else {
        console.log(`❌ Unexpected error status: ${status}`);
      }
    }

    // Test DELETE without authentication
    console.log('\n3️⃣ Testing DELETE /api/wishlist without authentication...');
    
    try {
      const response = await axios.delete(`${BASE_URL}/wishlist`, {
        data: { product_id: 1 }
      });
      console.log(`❌ Unexpected success - should require authentication`);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.log(`✅ Correctly requires authentication (401)`);
      } else {
        console.log(`❌ Unexpected error status: ${status}`);
      }
    }

    console.log('\n🎯 Expected Behavior:');
    console.log('- All wishlist endpoints should require authentication');
    console.log('- Authenticated users can add/remove products from wishlist');
    console.log('- Wishlist data is stored in database with user_id and product_id');
    console.log('- Frontend shows wishlist icon in header with count badge');
    console.log('- Wishlist buttons appear on product cards and detail pages');
    console.log('- Users can move items from wishlist to cart');

    console.log('\n📋 Frontend Features to Test:');
    console.log('1. Login as a user');
    console.log('2. Navigate to product pages');
    console.log('3. Click heart icons to add products to wishlist');
    console.log('4. Check wishlist count in header');
    console.log('5. Visit /wishlist page to see saved items');
    console.log('6. Test "Move to Cart" functionality');
    console.log('7. Test removing items from wishlist');

    console.log('\n🔧 Database Setup Required:');
    console.log('- Run the updated database.sql to create wishlist_items table');
    console.log('- Table includes user_id, product_id, and created_at fields');
    console.log('- Unique constraint prevents duplicate wishlist entries');
    console.log('\n📋 For Supabase (PostgreSQL):');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the simple-wishlist-migration.sql script');
    console.log('4. This will create the wishlist_items table');
    console.log('\n🔍 Debugging Steps:');
    console.log('1. Check if wishlist_items table exists in Supabase');
    console.log('2. Verify Supabase environment variables are set');
    console.log('3. Check server logs for detailed error messages');
    console.log('4. Test API endpoint directly with curl or Postman');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWishlistFeature();
