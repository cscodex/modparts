# Local Development Commands

## 1. Initial Setup (One-time only)

### Install Dependencies
```bash
# Navigate to project directory
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"

# Install root dependencies (API dependencies)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## 2. Start Local Development Server

### Option A: Start Both Frontend and Backend Together
```bash
# Navigate to project root
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"

# Start the development server (runs both API and frontend)
node dev-server.js
```

### Option B: Start Frontend and Backend Separately

#### Terminal 1 - Start API Server:
```bash
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"
node dev-server.js
```

#### Terminal 2 - Start Frontend:
```bash
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main\frontend"
npm run dev
```

## 3. Access Your Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **API Test**: http://localhost:3000/api/products

## 4. Test Login Credentials

### Admin User:
- **Email**: `admin@yamahaparts.com`
- **Password**: `admin123`

### Your User:
- **Email**: `charan881130@gmail.com`
- **Password**: `Merit123#`

## 5. Development Workflow Commands

### Check if servers are running:
```bash
# Check if port 3000 is in use (API server)
netstat -ano | findstr :3000

# Check if port 5173 is in use (Frontend server)
netstat -ano | findstr :5173
```

### Stop servers:
```bash
# Stop all Node.js processes
taskkill /f /im node.exe

# Or use Ctrl+C in the terminal where servers are running
```

### Restart development:
```bash
# Navigate to project root
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"

# Start development server
node dev-server.js
```

## 6. Database Connection Test

### Test Supabase Connection:
```bash
# Create a test file
echo 'require("dotenv").config({path:".env.local"});const{createClient}=require("@supabase/supabase-js");const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY);supabase.from("products").select("*").limit(1).then(({data,error})=>console.log(error?"Error:",error:"Connected! Sample product:",data[0]));' > test-db.js

# Run the test
node test-db.js

# Clean up
del test-db.js
```

## 7. API Endpoint Testing

### Test API endpoints manually:
```bash
# Test products endpoint
curl http://localhost:3000/api/products

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"charan881130@gmail.com\",\"password\":\"Merit123#\"}"
```

## 8. Frontend Build Test (Local)

```bash
# Navigate to frontend directory
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview

# Go back to root
cd ..
```

## 9. Environment Variables Check

```bash
# Check if .env.local exists and has required variables
type .env.local
```

## 10. Troubleshooting Commands

### Clear npm cache:
```bash
npm cache clean --force
```

### Reinstall dependencies:
```bash
# Remove node_modules and reinstall
rmdir /s node_modules
npm install

# Do the same for frontend
cd frontend
rmdir /s node_modules
npm install
cd ..
```

### Check Node.js version:
```bash
node --version
npm --version
```

### View development server logs:
```bash
# The dev-server.js will show logs in the terminal
# Look for:
# - "Server running on port 3000"
# - API request logs
# - Error messages
```

## 11. Quick Start Script

Create a batch file for quick startup:

```batch
@echo off
echo Starting Yamaha RD Parts Shop Development Server...
cd /d "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"
echo.
echo Starting API and Frontend servers...
node dev-server.js
```

Save this as `start-dev.bat` and double-click to start development.
