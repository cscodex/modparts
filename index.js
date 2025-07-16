// Entry point for production deployment
// This file simply requires and starts the dev-server

console.log('🚀 Starting Sardaarji Auto Parts server...');
console.log('📁 Current directory:', __dirname);
console.log('🔧 Node environment:', process.env.NODE_ENV || 'development');

// Start the dev server
require('./dev-server.js');
