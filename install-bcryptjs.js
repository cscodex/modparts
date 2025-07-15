#!/usr/bin/env node

// Simple script to install bcryptjs
console.log('🔧 Installing bcryptjs...');

try {
  const { execSync } = require('child_process');
  execSync('npm install bcryptjs --save', { stdio: 'inherit' });
  console.log('✅ bcryptjs installed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to install bcryptjs:', error.message);
  console.log('⚠️ Trying alternative installation method...');
  
  try {
    execSync('npm install bcryptjs@latest --no-save', { stdio: 'inherit' });
    console.log('✅ bcryptjs installed with alternative method!');
    process.exit(0);
  } catch (altError) {
    console.error('❌ All installation attempts failed:', altError.message);
    process.exit(1);
  }
}
