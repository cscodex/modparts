// Script to check if bcrypt is available and install bcryptjs if not
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking bcrypt compatibility...');

try {
  // Try to require bcrypt
  require('bcrypt');
  console.log('✅ bcrypt is working correctly!');
} catch (error) {
  console.log('❌ bcrypt error detected:', error.message);
  console.log('🔄 Switching to bcryptjs...');
  
  try {
    // Install bcryptjs
    console.log('📦 Installing bcryptjs...');
    execSync('npm install bcryptjs --save', { stdio: 'inherit' });
    
    // Update auth files to use bcryptjs
    const authFiles = [
      path.join(__dirname, 'api', 'auth', 'login.js'),
      path.join(__dirname, 'api', 'auth', 'register.js')
    ];
    
    authFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`📝 Updating ${file}...`);
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/require\(['"]bcrypt['"]\)/g, 'require("bcryptjs")');
        fs.writeFileSync(file, content);
      }
    });
    
    console.log('✅ Successfully switched to bcryptjs!');
  } catch (installError) {
    console.error('❌ Failed to install bcryptjs:', installError);
    process.exit(1);
  }
}

console.log('🚀 Authentication system ready!');
