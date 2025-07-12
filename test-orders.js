const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testOrdersAPI() {
  console.log('📋 Testing Orders API...')
  
  try {
    // First, register and login to get a token
    const testEmail = `orderstest${Date.now()}@example.com`

    console.log('\n1️⃣ Registering new user for orders testing...')
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: 'testpassword123',
      first_name: 'Orders',
      last_name: 'Test'
    })

    if (registerResponse.status === 201) {
      console.log('✅ User registered successfully')
    } else {
      console.log('❌ Registration failed:', registerResponse.status)
      return
    }

    console.log('\n2️⃣ Logging in to get authentication token...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'testpassword123'
    })
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Login successful, token received:', loginResponse.data.token ? 'Yes' : 'No')
    } else {
      console.log('❌ Login failed:', loginResponse.status)
      return
    }

    const token = loginResponse.data.token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    console.log('\n3️⃣ Testing GET /api/orders...')
    const ordersResponse = await axios.get(`${BASE_URL}/orders`, { headers })
    
    if (ordersResponse.status === 200) {
      console.log('✅ Orders retrieved:', ordersResponse.status, '-', ordersResponse.data.data.length, 'orders')
      if (ordersResponse.data.data.length > 0) {
        console.log('📋 First order:', JSON.stringify(ordersResponse.data.data[0], null, 2))
      }
    } else {
      console.log('❌ Orders retrieval failed:', ordersResponse.status)
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Orders API failed:', error.response.status, '-', error.response.data.message)
      console.log('Full error:', error.response.data)
    } else {
      console.log('❌ Network error:', error.message)
    }
  }
}

testOrdersAPI()
