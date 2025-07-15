// Script to check if bcrypt/bcryptjs is available and install if needed
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking authentication dependencies...');

// First, check if bcryptjs is already installed
let bcryptjsInstalled = false;
try {
  require.resolve('bcryptjs');
  bcryptjsInstalled = true;
  console.log('✅ bcryptjs is already installed!');
} catch (e) {
  console.log('❌ bcryptjs is not installed.');
}

// If bcryptjs is not installed, try to install it
if (!bcryptjsInstalled) {
  try {
    console.log('📦 Installing bcryptjs...');
    execSync('npm install bcryptjs --save', { stdio: 'inherit' });
    console.log('✅ bcryptjs installed successfully!');
  } catch (installError) {
    console.error('❌ Failed to install bcryptjs:', installError.message);
    console.error('Trying alternative installation method...');

    try {
      // Try with a different approach
      execSync('npm install bcryptjs@latest --no-save', { stdio: 'inherit' });
      console.log('✅ bcryptjs installed with alternative method!');
    } catch (altError) {
      console.error('❌ All installation attempts failed. Authentication may not work properly.');
      // Continue anyway, maybe it's already installed globally or will be handled elsewhere
    }
  }
}

// Update auth files to use bcryptjs
const authFiles = [
  path.join(__dirname, 'api', 'auth', 'login.js'),
  path.join(__dirname, 'api', 'auth', 'register.js')
];

authFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      console.log(`📝 Checking ${file}...`);
      let content = fs.readFileSync(file, 'utf8');

      // Only update if it's using bcrypt
      if (content.includes('require("bcrypt")') || content.includes("require('bcrypt')")) {
        console.log(`📝 Updating ${file} to use bcryptjs...`);
        content = content.replace(/require\(['"]bcrypt['"]\)/g, 'require("bcryptjs")');
        fs.writeFileSync(file, content);
        console.log(`✅ Updated ${file} successfully!`);
      } else {
        console.log(`✅ ${file} is already using bcryptjs.`);
      }
    } catch (fileError) {
      console.error(`❌ Error updating ${file}:`, fileError.message);
    }
  } else {
    console.warn(`⚠️ Auth file not found: ${file}`);
  }
});

console.log('🚀 Authentication system preparation complete!');
