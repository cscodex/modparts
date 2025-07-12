const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

async function testUploadAPI() {
  console.log('🔧 Testing Upload API...')

  try {
    // Create a simple test image file (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, 'test-image.png')
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    fs.writeFileSync(testImagePath, pngData)
    console.log('✅ Created test image file')

    // Test 1: Upload the test image
    console.log('\n1️⃣ Testing image upload...')
    
    const formData = new FormData()
    formData.append('image', fs.createReadStream(testImagePath))

    const uploadResponse = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    })

    console.log('✅ Upload successful:', uploadResponse.data)

    // Test 2: Test upload without file
    console.log('\n2️⃣ Testing upload without file...')
    
    try {
      const emptyFormData = new FormData()
      await axios.post('http://localhost:3000/api/upload', emptyFormData, {
        headers: {
          ...emptyFormData.getHeaders()
        }
      })
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected upload without file:', error.response.data.message)
      } else {
        throw error
      }
    }

    // Test 3: Test OPTIONS request (CORS preflight)
    console.log('\n3️⃣ Testing CORS preflight...')
    
    const optionsResponse = await axios.options('http://localhost:3000/api/upload')
    console.log('✅ CORS preflight successful, status:', optionsResponse.status)

    // Clean up test file
    fs.unlinkSync(testImagePath)
    console.log('✅ Cleaned up test image file')

    console.log('\n🎉 SUCCESS: Upload API is working correctly!')

  } catch (error) {
    console.error('❌ Upload API test failed:', error.response?.data || error.message)
    
    // Clean up test file if it exists
    const testImagePath = path.join(__dirname, 'test-image.png')
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath)
    }
  }
}

testUploadAPI()
