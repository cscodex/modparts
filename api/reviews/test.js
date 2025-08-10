module.exports = async function handler(req, res) {
  console.log('🧪 Reviews test endpoint called')
  
  return res.status(200).json({
    success: true,
    message: 'Reviews API test endpoint working!',
    method: req.method,
    path: req.path,
    query: req.query
  })
}
