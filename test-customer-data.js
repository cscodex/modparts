// Test script to verify customer data in admin orders API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCustomerData() {
  console.log('🧪 Testing Customer Data in Admin Orders...\n');

  try {
    // Test the admin orders endpoint
    console.log('1️⃣ Testing GET /api/admin/orders for customer data...');
    
    try {
      const response = await axios.get(`${BASE_URL}/admin/orders`);
      
      if (response.data && response.data.success && response.data.data) {
        const orders = response.data.data;
        console.log(`✅ Found ${orders.length} orders`);
        
        // Check customer data in first few orders
        const ordersToCheck = orders.slice(0, 3);
        
        ordersToCheck.forEach((order, index) => {
          console.log(`\n📋 Order ${index + 1} (ID: ${order.id}):`);
          console.log(`   Customer Name: "${order.customer_name || 'MISSING'}"`);
          console.log(`   Customer Email: "${order.customer_email || 'MISSING'}"`);
          console.log(`   Customer Phone: "${order.customer_phone || 'N/A'}"`);
          console.log(`   User Object: ${order.user ? 'Present' : 'Missing'}`);
          
          if (order.user) {
            console.log(`   User Details: ${order.user.first_name || 'No first name'} ${order.user.last_name || 'No last name'} (${order.user.email || 'No email'})`);
          }
          
          // Check if customer data is properly populated
          const hasCustomerName = order.customer_name && order.customer_name !== 'Unknown Customer';
          const hasCustomerEmail = order.customer_email && order.customer_email !== 'No email provided';
          
          console.log(`   Status: ${hasCustomerName ? '✅' : '❌'} Name, ${hasCustomerEmail ? '✅' : '❌'} Email`);
        });
        
        // Summary
        const ordersWithCustomerData = orders.filter(order => 
          order.customer_name && 
          order.customer_name !== 'Unknown Customer' &&
          order.customer_email &&
          order.customer_email !== 'No email provided'
        );
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total Orders: ${orders.length}`);
        console.log(`   Orders with Customer Data: ${ordersWithCustomerData.length}`);
        console.log(`   Success Rate: ${((ordersWithCustomerData.length / orders.length) * 100).toFixed(1)}%`);
        
        if (ordersWithCustomerData.length === orders.length) {
          console.log(`🎉 All orders have complete customer data!`);
        } else if (ordersWithCustomerData.length > 0) {
          console.log(`⚠️ Some orders missing customer data`);
        } else {
          console.log(`❌ No orders have customer data - issue needs investigation`);
        }
        
      } else {
        console.log(`❌ Invalid response format:`, response.data);
      }
      
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        console.log(`⚠️ Admin Orders: Authentication required (401) - This is expected without a valid admin token`);
        console.log(`   To test with authentication, you would need to:`);
        console.log(`   1. Login as an admin user`);
        console.log(`   2. Get the JWT token`);
        console.log(`   3. Include it in the Authorization header`);
      } else if (status === 403) {
        console.log(`⚠️ Admin Orders: Access forbidden (403) - User may not have admin privileges`);
      } else if (status === 404) {
        console.log(`❌ Admin Orders: Endpoint not found (404)`);
      } else {
        console.log(`❌ Admin Orders: Error ${status} - ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎯 Expected Behavior:');
    console.log('- Each order should have customer_name field populated');
    console.log('- Each order should have customer_email field populated');
    console.log('- Customer data should come from user table via user_id');
    console.log('- Fallback to order fields if user data is missing');
    console.log('- Frontend should display customer name and email in table');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCustomerData();
