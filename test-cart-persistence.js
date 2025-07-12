const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testCartPersistence() {
  console.log('🛒 Testing Cart Persistence...')
  
  try {
    // First, register and login to get a token
    const testEmail = `cartpersist${Date.now()}@example.com`
    
    console.log('\n1️⃣ Registering new user for cart persistence testing...')
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: 'testpassword123',
      first_name: 'Cart',
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
      console.log('✅ Login successful, token received')
    } else {
      console.log('❌ Login failed:', loginResponse.status)
      return
    }

    const token = loginResponse.data.token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    console.log('\n3️⃣ Testing initial empty cart...')
    const initialCartResponse = await axios.get(`${BASE_URL}/cart`, { headers })
    console.log('✅ Initial cart:', initialCartResponse.data.data.length, 'items')

    console.log('\n4️⃣ Adding first product to cart...')
    const addResponse1 = await axios.post(`${BASE_URL}/cart`, {
      product_id: 1,
      quantity: 2
    }, { headers })
    
    if (addResponse1.status === 201) {
      console.log('✅ First product added:', addResponse1.data.message)
    }

    console.log('\n5️⃣ Checking cart after first addition...')
    const cartAfterFirst = await axios.get(`${BASE_URL}/cart`, { headers })
    console.log('✅ Cart after first addition:', cartAfterFirst.data.data.length, 'items')
    if (cartAfterFirst.data.data.length > 0) {
      console.log('📦 First item:', JSON.stringify(cartAfterFirst.data.data[0], null, 2))
    }

    console.log('\n6️⃣ Adding second product to cart...')
    const addResponse2 = await axios.post(`${BASE_URL}/cart`, {
      product_id: 2,
      quantity: 1
    }, { headers })
    
    if (addResponse2.status === 201) {
      console.log('✅ Second product added:', addResponse2.data.message)
    }

    console.log('\n7️⃣ Checking final cart state...')
    const finalCartResponse = await axios.get(`${BASE_URL}/cart`, { headers })
    console.log('✅ Final cart:', finalCartResponse.data.data.length, 'items')
    
    if (finalCartResponse.data.data.length > 0) {
      console.log('📦 All cart items:')
      finalCartResponse.data.data.forEach((item, index) => {
        console.log(`   ${index + 1}. Product ID: ${item.product_id}, Quantity: ${item.quantity}, Product: ${item.product?.name || 'Unknown'}`)
      })
    }

    console.log('\n8️⃣ Testing cart persistence with another GET request...')
    const persistenceTestResponse = await axios.get(`${BASE_URL}/cart`, { headers })
    console.log('✅ Persistence test:', persistenceTestResponse.data.data.length, 'items')
    
    if (persistenceTestResponse.data.data.length === finalCartResponse.data.data.length) {
      console.log('🎉 SUCCESS: Cart persistence is working!')
    } else {
      console.log('❌ FAILURE: Cart items not persisting between requests')
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Cart persistence test failed:', error.response.status, '-', error.response.data.message)
      console.log('Full error:', error.response.data)
    } else {
      console.log('❌ Network error:', error.message)
    }
  }
}

testCartPersistence()
