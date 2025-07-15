const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
  } catch (error) {
    return null
  }
}

module.exports = async (req, res) => {
  // CORS is handled by dev-server middleware

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only POST requests are supported.'
    })
  }

  try {
    // Verify authentication
    const user = verifyToken(req)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    console.log('Processing file upload for user:', user.email)
    console.log('Content-Type:', req.headers['content-type'])
    console.log('Body type:', typeof req.body)

    // Handle JSON-based upload (base64 encoded)
    if (req.headers['content-type']?.includes('application/json')) {
      const { filename, mimetype, data } = req.body

      console.log('📤 Processing image upload:', {
        filename,
        mimetype,
        dataLength: data?.length || 0,
        user: user.email || user.id
      })

      if (!filename || !mimetype || !data) {
        console.error('❌ Missing required fields for upload')
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: filename, mimetype, data (base64)'
        })
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
        })
      }

      // Decode base64 data
      const buffer = Buffer.from(data, 'base64')

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (buffer.length > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        })
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads')

      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
        console.log('Created uploads directory:', uploadDir)
      }

      // Generate unique filename
      const fileExtension = path.extname(filename)
      const uniqueSuffix = crypto.randomBytes(16).toString('hex')
      const newFilename = `img_${Date.now()}_${uniqueSuffix}${fileExtension}`
      const filePath = path.join(uploadDir, newFilename)
      const fileUrl = `/uploads/${newFilename}`

      // Save file to disk
      try {
        fs.writeFileSync(filePath, buffer)
        console.log('✅ File saved successfully to:', filePath)
      } catch (writeError) {
        console.error('❌ Error writing file:', writeError)
        return res.status(500).json({
          success: false,
          message: 'Failed to save file to disk',
          error: writeError.message
        })
      }

      // Return success response with both formats for compatibility
      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        file_url: fileUrl,  // Frontend expects this field
        data: {
          filename: newFilename,
          originalName: filename,
          size: buffer.length,
          mimetype: mimetype,
          url: fileUrl,
          path: filePath
        }
      })
    }

    // For multipart/form-data, return a helpful message for now
    return res.status(400).json({
      success: false,
      message: 'Multipart form upload not yet implemented. Please use JSON with base64 encoded data.',
      example: {
        filename: 'image.png',
        mimetype: 'image/png',
        data: 'base64_encoded_image_data_here'
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload',
      error: error.message
    })
  }
}
