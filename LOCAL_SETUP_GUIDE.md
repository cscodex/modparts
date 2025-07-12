# Local Development Setup Guide

## ✅ Current Status
- **Supabase Connectivity**: ✅ Working
- **Database Tables**: ✅ All accessible
- **Cart Operations**: ✅ Working
- **Authentication**: ✅ Working
- **API Endpoints**: ✅ Functional

## 🚀 Quick Start Commands

### 1. Start Development Server
```bash
# Navigate to project directory
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"

# Start the development server (runs both API and frontend)
node dev-server.js
```

### 2. Access Your Application
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **API Test**: http://localhost:3000/api/products

## 🔑 Login Credentials

### Admin User:
- **Email**: `admin@yamahaparts.com`
- **Password**: `admin123`

### Your User:
- **Email**: `charan881130@gmail.com`
- **Password**: `Merit123#`

## 🧪 Test All Functionality

### Test API Endpoints:
```bash
# Test Supabase connectivity
node test-supabase-connectivity.js

# Test cart functionality
node test-cart-simple.js

# Test all endpoints
node test-all-endpoints.js
```

### Test Frontend Features:
1. **User Registration/Login** ✅
2. **Product Browsing** ✅
3. **Add to Cart** ✅
4. **Admin Dashboard** ✅
5. **User Management** ✅
6. **Profile Updates** ✅

## 🔧 Troubleshooting

### If server won't start:
```bash
# Kill any existing Node processes
taskkill /f /im node.exe

# Restart server
node dev-server.js
```

### If API calls fail:
```bash
# Check if server is running on port 3000
netstat -ano | findstr :3000

# Test API directly
curl http://localhost:3000/api/products
```

### If database connection fails:
```bash
# Test Supabase connectivity
node test-supabase-connectivity.js
```

## 📁 Project Structure
```
/
├── api/                    # Vercel serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── admin/             # Admin endpoints
│   ├── products/          # Product endpoints
│   ├── cart/              # Cart endpoints
│   ├── categories/        # Category endpoints
│   ├── orders/            # Order endpoints
│   └── users/             # User endpoints
├── frontend/              # React application
├── lib/                   # Shared utilities
├── package.json           # Root dependencies for API
├── dev-server.js          # Development server
├── vercel.json            # Vercel configuration
└── .env.local             # Environment variables
```

## 🌐 Environment Variables
All environment variables are properly configured in `.env.local`:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ JWT_SECRET

## 📊 Database Status
- ✅ **users** table: Working
- ✅ **products** table: Working (87 products)
- ✅ **categories** table: Working
- ✅ **cart_items** table: Working (fixed foreign key issues)
- ✅ **orders** table: Working

## 🔄 Development Workflow

1. **Make changes** to code
2. **Server auto-restarts** (if using nodemon) or restart manually
3. **Test changes** in browser at http://localhost:5173
4. **Test API** endpoints if needed
5. **Commit changes** when ready

## 🚀 Ready for Production
Your application is now ready for deployment to Render or Vercel!
