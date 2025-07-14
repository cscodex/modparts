const { supabase } = require('../../lib/supabase')

module.exports = async function handler(req, res) {
  console.log('🧪 Test API called')
  
  try {
    // Test Supabase connection
    console.log('Testing Supabase connection...')
    
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection error:', error)
      return res.status(500).json({
        message: 'Supabase connection failed',
        error: error.message
      })
    }
    
    console.log('✅ Supabase connection successful')
    console.log('✅ Environment variables check:')
    console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing')
    console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing')
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing')
    
    res.status(200).json({
      message: 'Test successful',
      supabase: 'Connected',
      environment: {
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
      }
    })
    
  } catch (error) {
    console.error('❌ Test API error:', error)
    res.status(500).json({
      message: 'Test failed',
      error: error.message
    })
  }
}
