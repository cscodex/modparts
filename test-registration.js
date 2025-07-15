// Test script to verify registration functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRegistration() {
  console.log('🧪 Testing User Registration Functionality...\n');

  try {
    // Test 1: Test registration with valid data
    console.log('1️⃣ Testing user registration...');
    
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      first_name: 'Test',
      last_name: 'User',
      phone: '1234567890',
      address: '123 Test Street'
    };

    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
      
      console.log(`✅ Registration successful:`, response.data);
      
      if (response.data.verification_required) {
        console.log(`📧 Email verification required - check your email`);
      } else {
        console.log(`🔑 Login token provided - registration complete`);
      }
      
      if (response.data.user) {
        console.log(`👤 User created with ID: ${response.data.user.id}`);
      }
      
    } catch (regError) {
      const status = regError.response?.status;
      const data = regError.response?.data;
      
      if (status === 409) {
        console.log(`⚠️ User already exists - this is expected for duplicate emails`);
      } else if (status === 400) {
        console.log(`❌ Registration validation error:`, data?.message);
      } else if (status === 500) {
        console.log(`❌ Server error during registration:`, data?.message);
        console.log(`❌ Error details:`, data?.error);
      } else {
        console.log(`❌ Registration failed (${status}):`, data);
      }
    }

    // Test 2: Test registration with missing fields
    console.log('\n2️⃣ Testing registration validation...');
    
    try {
      const invalidUser = {
        email: 'test@example.com'
        // Missing required fields
      };

      const response = await axios.post(`${BASE_URL}/auth/register`, invalidUser);
      console.log(`❌ Unexpected success - should have failed validation`);
    } catch (validationError) {
      const status = validationError.response?.status;
      if (status === 400) {
        console.log(`✅ Validation working - rejected incomplete data`);
      } else {
        console.log(`❌ Unexpected error: ${status}`);
      }
    }

    console.log('\n🎯 Expected Behavior:');
    console.log('- Registration should work without email verification setup');
    console.log('- Should return user data and token (if no email verification)');
    console.log('- Should require email verification (if email service enabled)');
    console.log('- Should validate required fields');
    console.log('- Should handle duplicate emails gracefully');

    console.log('\n📧 Email Verification Status:');
    console.log('- If nodemailer not installed: Normal registration with token');
    console.log('- If nodemailer installed but no SMTP config: Normal registration');
    console.log('- If full email setup: Registration with email verification required');

    console.log('\n🔧 What Was Fixed:');
    console.log('- Made email verification completely optional');
    console.log('- Graceful fallback when email service unavailable');
    console.log('- Enhanced error logging for debugging');
    console.log('- Proper handling of missing database columns');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRegistration();
