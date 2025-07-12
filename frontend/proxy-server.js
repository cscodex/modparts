const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Proxy API requests to the PHP backend
app.use('/api', proxy('http://localhost/Modparts', {
  proxyReqPathResolver: function(req) {
    return req.originalUrl;
  },
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    // Set CORS headers
    userRes.set('Access-Control-Allow-Origin', '*');
    userRes.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    userRes.set('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

    return proxyResData;
  }
}));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
