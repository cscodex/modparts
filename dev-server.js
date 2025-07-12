// Development server for local testing
// This simulates the Vercel serverless function environment locally

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// API route handler - dynamically load API functions
app.all('/api/*', async (req, res) => {
  try {
    // Extract the API path
    const apiPath = req.path.replace('/api/', '');
    console.log(`API Request: ${req.method} ${req.path}`);
    console.log('API Path:', apiPath);
    
    // Convert path to file path
    let filePath;
    if (apiPath.includes('/')) {
      // Handle nested routes like auth/login, products/123, cart/456
      const parts = apiPath.split('/');
      if (parts.length === 2 && !isNaN(parts[1])) {
        // Handle dynamic routes like products/123 -> products/[id].js
        filePath = path.join(__dirname, 'api', parts[0], '[id].js');
        req.query.id = parts[1]; // Add ID to query params
      } else {
        // Handle regular nested routes like auth/login -> auth/login.js
        filePath = path.join(__dirname, 'api', ...parts) + '.js';
      }
    } else {
      // Handle root level routes like products -> products/index.js
      filePath = path.join(__dirname, 'api', apiPath, 'index.js');
    }
    
    console.log('Trying file path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found, returning 404');
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    // Clear require cache to allow hot reloading during development
    delete require.cache[require.resolve(filePath)];
    
    // Load and execute the API function
    const apiModule = require(filePath);
    const handler = apiModule.default || apiModule;
    
    if (typeof handler !== 'function') {
      console.error('API module does not export a function');
      return res.status(500).json({ message: 'Invalid API endpoint' });
    }
    
    // Create a mock request/response object similar to Vercel
    const mockReq = {
      ...req,
      query: { ...req.query, ...req.params },
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    };
    
    const mockRes = {
      status: (code) => {
        res.status(code);
        return mockRes;
      },
      json: (data) => {
        res.json(data);
        return mockRes;
      },
      send: (data) => {
        res.send(data);
        return mockRes;
      },
      end: (data) => {
        res.end(data);
        return mockRes;
      },
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return mockRes;
      }
    };
    
    // Execute the handler
    await handler(mockReq, mockRes);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. Run "npm run build" first.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log('📁 Serving static files from: public/');
  console.log('🔌 API endpoints available at: /api/*');
  console.log('');
  console.log('Available API endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/register');
  console.log('  GET  /api/products');
  console.log('  GET  /api/categories');
  console.log('  GET  /api/cart');
  console.log('  POST /api/cart');
  console.log('  GET  /api/orders');
  console.log('  POST /api/orders');
  console.log('  GET  /api/users/profile');
  console.log('  PUT  /api/users/profile');
  console.log('');
  console.log('💡 Make sure to:');
  console.log('  1. Set up your Supabase database');
  console.log('  2. Copy .env.example to .env.local');
  console.log('  3. Fill in your environment variables');
  console.log('  4. Run "npm run build" to build the frontend');
});

module.exports = app;
