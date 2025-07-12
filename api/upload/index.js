const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// Simple file upload handler without multer (for compatibility with our dev server)
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Only POST requests are supported.'
    })
  }

  try {
    // For now, return a mock successful upload response
    // In a real implementation, you would parse multipart form data
    // and save the uploaded file to the uploads directory

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate a mock filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex')
    const mockFilename = `img_${uniqueSuffix}.png`
    const fileUrl = `/uploads/${mockFilename}`

    // Return mock success response
    res.status(200).json({
      success: true,
      message: 'File upload endpoint is available (mock response)',
      data: {
        filename: mockFilename,
        originalName: 'uploaded-image.png',
        size: 1024,
        mimetype: 'image/png',
        url: fileUrl,
        path: path.join(uploadDir, mockFilename),
        note: 'This is a mock response. Real file upload functionality would require proper multipart form parsing.'
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload'
    })
  }
}
