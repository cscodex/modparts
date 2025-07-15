#!/usr/bin/env node

// Startup script that ensures bcryptjs is available before starting the server
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting server with bcrypt compatibility check...');

// Function to check if a module is available
function isModuleAvailable(moduleName) {
  try {
    require.resolve(moduleName);
    return true;
  } catch (e) {
    return false;
  }
}

// Ensure bcryptjs is available
if (!isModuleAvailable('bcryptjs')) {
  console.log('📦 bcryptjs not found, installing...');
  try {
    execSync('npm install bcryptjs --no-save', { stdio: 'inherit' });
    console.log('✅ bcryptjs installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install bcryptjs:', error.message);
    console.log('🔄 Trying alternative installation...');
    
    try {
      // Try installing in the current directory
      execSync('npm install bcryptjs@latest --no-save --prefer-offline', { stdio: 'inherit' });
      console.log('✅ bcryptjs installed with alternative method!');
    } catch (altError) {
      console.error('❌ All installation attempts failed.');
      console.log('⚠️ Server will start anyway, but authentication may not work.');
    }
  }
} else {
  console.log('✅ bcryptjs is already available!');
}

// Update auth files to use bcryptjs if they're still using bcrypt
const authFiles = [
  path.join(__dirname, 'api', 'auth', 'login.js'),
  path.join(__dirname, 'api', 'auth', 'register.js'),
  path.join(__dirname, 'api', 'users', 'profile.js')
];

authFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('require("bcrypt")') || content.includes("require('bcrypt')")) {
        console.log(`📝 Updating ${path.basename(file)} to use bcryptjs...`);
        content = content.replace(/require\(['"]bcrypt['"]\)/g, 'require("bcryptjs")');
        fs.writeFileSync(file, content);
        console.log(`✅ Updated ${path.basename(file)} successfully!`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${path.basename(file)}:`, error.message);
    }
  }
});

console.log('🔧 Starting development server...');

// Start the actual server
require('./dev-server.js');
