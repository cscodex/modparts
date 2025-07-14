// Debug frontend login issue
const axios = require('axios');

async function debugFrontendLogin() {
  try {
    console.log('🔍 DEBUGGING: Frontend Login Issue\n');
    
    // Test 1: Direct API login (what works on port 3000)
    console.log('1️⃣ Testing direct API login...');
    try {
      const directResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'charan881130@gmail.com',
        password: 'Merit123#'
      });
      
      console.log('✅ Direct API login successful:');
      console.log(`- Status: ${directResponse.status}`);
      console.log(`- Token: ${directResponse.data.token ? 'Present' : 'Missing'}`);
      console.log(`- User: ${directResponse.data.user?.email || 'Missing'}`);
      console.log(`- Message: ${directResponse.data.message}`);
      
    } catch (error) {
      console.log('❌ Direct API login failed:');
      console.log(`- Status: ${error.response?.status}`);
      console.log(`- Message: ${error.response?.data?.message}`);
    }
    
    // Test 2: Check CORS headers
    console.log('\n2️⃣ Testing CORS headers...');
    try {
      const corsResponse = await axios.options('http://localhost:3000/api/auth/login');
      console.log('✅ CORS OPTIONS request successful:');
      console.log(`- Status: ${corsResponse.status}`);
      console.log(`- CORS Headers:`, corsResponse.headers);
      
    } catch (error) {
      console.log('❌ CORS OPTIONS failed:', error.message);
    }
    
    // Test 3: Simulate frontend request with exact headers
    console.log('\n3️⃣ Simulating frontend request...');
    try {
      const frontendHeaders = {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/',
        'User-Agent': 'Mozilla/5.0 (Frontend Simulation)'
      };
      
      const frontendResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'charan881130@gmail.com',
        password: 'Merit123#'
      }, { 
        headers: frontendHeaders,
        withCredentials: true
      });
      
      console.log('✅ Frontend simulation successful:');
      console.log(`- Status: ${frontendResponse.status}`);
      console.log(`- Token: ${frontendResponse.data.token ? 'Present' : 'Missing'}`);
      
    } catch (error) {
      console.log('❌ Frontend simulation failed:');
      console.log(`- Status: ${error.response?.status}`);
      console.log(`- Message: ${error.response?.data?.message}`);
      console.log(`- Headers: ${JSON.stringify(error.response?.headers, null, 2)}`);
    }
    
    // Test 4: Check if auth endpoint exists
    console.log('\n4️⃣ Testing auth endpoints availability...');
    const endpoints = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/auth/me'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:3000${endpoint}`);
        console.log(`✅ ${endpoint}: Available (${response.status})`);
      } catch (error) {
        const status = error.response?.status;
        if (status === 405) {
          console.log(`✅ ${endpoint}: Available (Method not allowed - expected for GET)`);
        } else if (status === 401) {
          console.log(`✅ ${endpoint}: Available (Unauthorized - expected)`);
        } else {
          console.log(`❌ ${endpoint}: Error ${status}`);
        }
      }
    }
    
    // Test 5: Check dev-server routing
    console.log('\n5️⃣ Testing dev-server routing...');
    try {
      // Test if the dev-server is properly routing auth requests
      const routingResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
      console.log('Unexpected success with wrong credentials');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Dev-server routing working (correctly rejected wrong credentials)');
      } else if (error.response?.status === 404) {
        console.log('❌ Dev-server routing issue: Auth endpoint not found');
      } else {
        console.log(`✅ Dev-server routing working (status: ${error.response?.status})`);
      }
    }
    
    // Test 6: Check if there are multiple auth files
    console.log('\n6️⃣ Checking auth implementation...');
    console.log('Auth files that should exist:');
    console.log('- api/auth/login.js');
    console.log('- api/auth/register.js');
    console.log('- api/auth/me.js');
    
    // Test 7: Test with different credentials
    console.log('\n7️⃣ Testing with different credentials...');
    const testCredentials = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'user@example.com', password: 'user123' },
      { email: 'test@test.com', password: 'test123' }
    ];
    
    for (const creds of testCredentials) {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', creds);
        console.log(`✅ Login successful for ${creds.email}`);
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        console.log(`❌ Login failed for ${creds.email}: ${status} - ${message}`);
      }
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    console.log('If direct API works but frontend fails, check:');
    console.log('1. Frontend API configuration (baseURL)');
    console.log('2. CORS settings in dev-server');
    console.log('3. Frontend authentication context');
    console.log('4. Browser network tab for actual error');
    console.log('5. Frontend console for JavaScript errors');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugFrontendLogin();
