// Simple test script to verify the setup
// Run with: node test-setup.js

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Yamaha RD Parts Shop Setup...\n');

// Test 1: Check if required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'vercel.json',
  '.env.example',
  'lib/supabase.js',
  'api/auth/login.js',
  'api/auth/register.js',
  'api/products/index.js',
  'api/categories/index.js',
  'api/cart/index.js',
  'api/orders/index.js',
  'api/users/profile.js',
  'supabase-schema.sql',
  'DEPLOYMENT.md',
  'DEPLOYMENT_CHECKLIST.md',
  'frontend/package.json',
  'frontend/vite.config.js',
  'frontend/src/api/config.js'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@supabase/supabase-js', 'bcryptjs', 'jsonwebtoken', 'cors'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      missingFiles.push(`dependency: ${dep}`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Test 3: Check frontend dependencies
console.log('\n🎨 Checking frontend dependencies...');
try {
  const frontendPackageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  console.log(`✅ React: ${frontendPackageJson.dependencies.react}`);
  console.log(`✅ Vite: ${frontendPackageJson.devDependencies.vite}`);
  console.log(`✅ Tailwind: ${frontendPackageJson.devDependencies.tailwindcss}`);
} catch (error) {
  console.log('❌ Error reading frontend/package.json:', error.message);
}

// Test 4: Check API structure
console.log('\n🔌 Checking API structure...');
const apiEndpoints = [
  'api/auth/login.js',
  'api/auth/register.js',
  'api/products/index.js',
  'api/categories/index.js',
  'api/cart/index.js',
  'api/cart/[id].js',
  'api/orders/index.js',
  'api/users/profile.js'
];

apiEndpoints.forEach(endpoint => {
  if (fs.existsSync(endpoint)) {
    console.log(`✅ ${endpoint}`);
  } else {
    console.log(`❌ ${endpoint} - MISSING`);
  }
});

// Test 5: Check environment configuration
console.log('\n🔧 Checking environment configuration...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`✅ ${envVar} defined in .env.example`);
    } else {
      console.log(`❌ ${envVar} - MISSING from .env.example`);
    }
  });
} else {
  console.log('❌ .env.example file missing');
}

// Summary
console.log('\n📊 Test Summary:');
if (missingFiles.length === 0) {
  console.log('🎉 All tests passed! Your setup looks good.');
  console.log('\n📋 Next steps:');
  console.log('1. Set up your Supabase database using supabase-schema.sql');
  console.log('2. Copy .env.example to .env.local and fill in your credentials');
  console.log('3. Run "npm run dev" to test locally');
  console.log('4. Follow DEPLOYMENT.md to deploy to Vercel');
} else {
  console.log(`❌ ${missingFiles.length} issues found:`);
  missingFiles.forEach(file => console.log(`   - ${file}`));
  console.log('\nPlease fix these issues before proceeding.');
}

console.log('\n🔗 Useful links:');
console.log('- Supabase: https://supabase.com');
console.log('- Vercel: https://vercel.com');
console.log('- Deployment Guide: ./DEPLOYMENT.md');
console.log('- Deployment Checklist: ./DEPLOYMENT_CHECKLIST.md');
