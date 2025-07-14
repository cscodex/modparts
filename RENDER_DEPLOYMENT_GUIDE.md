# Render Deployment Guide

## 🎯 Overview
Deploy your Yamaha RD Parts Shop to Render with both frontend and backend.

## 📋 Prerequisites
- ✅ Code working locally
- ✅ Git repository (GitHub/GitLab)
- ✅ Render account (free tier available)

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to Git**:
```bash
# Add all files
git add .

# Commit changes
git commit -m "Prepare for Render deployment with Node.js/Supabase"

# Push to your repository
git push origin main
```

### Step 2: Create Render Services

#### Option A: Deploy as Static Site + Web Service

**Frontend (Static Site):**
1. Go to [render.com](https://render.com)
2. Click "New" → "Static Site"
3. Connect your Git repository
4. Configure:
   - **Name**: `yamaha-parts-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

**Backend (Web Service):**
1. Click "New" → "Web Service"
2. Connect your Git repository
3. Configure:
   - **Name**: `yamaha-parts-api`
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm install`
   - **Start Command**: `node dev-server.js`
   - **Instance Type**: Free

#### Option B: Deploy as Single Web Service (Recommended)

1. Click "New" → "Web Service"
2. Connect your Git repository
3. Configure:
   - **Name**: `yamaha-parts-shop`
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm install && cd frontend && npm install --include=dev && npm run build`
   - **Start Command**: `node dev-server.js`
   - **Instance Type**: Free

### Step 3: Environment Variables

Add these environment variables in Render dashboard:

```env
SUPABASE_URL=https://uwizdypmlvfvegklnogq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aXpkeXBtbHZmdmVna2xub2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Mzk3MDUsImV4cCI6MjA2NjUxNTcwNX0.KQ3_XiXJERD7mA4iZOaon82hcR7g6PBigelW_rie7Ew
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aXpkeXBtbHZmdmVna2xub2dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDkzOTcwNSwiZXhwIjoyMDY2NTE1NzA1fQ.9uRj8ao4jKsCOvmcnDYso5vP6CZHuUW2w0irGLDE9LQ
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aXpkeXBtbHZmdmVna2xub2dxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDkzOTcwNSwiZXhwIjoyMDY2NTE1NzA1fQ.9uRj8ao4jKsCOvmcnDYso5vP6CZHuUW2w0irGLDE9LQ

JWT_SECRET=cknBU1dk+r6v/xZojqR7fHOhDpBNltk6offArhevQpG7YS6AVio3n2iRD/ASCjAmSa/y9Rx1Z00IUxxvHUu58g==
NODE_ENV=production
```

### Step 4: Update Frontend API Configuration

Update `frontend/src/api/config.js` for production:

```javascript
// Use relative path for API calls
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
export const API_URL = isDevelopment ? "http://localhost:3000/api" : "/api";
```

### Step 5: Deploy

1. **Click "Deploy"** in Render dashboard
2. **Monitor build logs** for any errors
3. **Wait for deployment** to complete (usually 5-10 minutes)

## 🔧 Render Configuration Files

### Create `render.yaml` (Optional)
```yaml
services:
  - type: web
    name: yamaha-parts-shop
    env: node
    buildCommand: npm install && cd frontend && npm install --include=dev && npm run build
    startCommand: node dev-server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        value: https://uwizdypmlvfvegklnogq.supabase.co
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
```

## 🌐 Post-Deployment

### Test Your Deployed App

1. **Visit your Render URL** (e.g., `https://yamaha-parts-shop.onrender.com`)
2. **Test login** with your credentials
3. **Test cart functionality**
4. **Test admin features**

### Verify API Endpoints

```bash
# Replace with your Render URL
curl https://your-app.onrender.com/api/products
curl https://your-app.onrender.com/api/categories
```

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### App Won't Start
- Check start command: `node dev-server.js`
- Verify environment variables are set
- Check application logs

### API Calls Fail
- Verify environment variables
- Check CORS settings
- Test Supabase connectivity

### Database Connection Issues
- Verify Supabase credentials
- Check network connectivity
- Test with Supabase dashboard

## 📊 Monitoring

### Render Dashboard
- **Metrics**: CPU, Memory, Response time
- **Logs**: Application and build logs
- **Events**: Deployment history

### Health Checks
```bash
# Test app health
curl https://your-app.onrender.com/api/products

# Test database connectivity
curl https://your-app.onrender.com/api/categories
```

## 🔄 Updates and Redeployment

### Automatic Deployment
- **Push to Git** → **Auto-deploy** (if enabled)
- **Manual deploy** from Render dashboard

### Rolling Updates
- Render provides zero-downtime deployments
- Previous version stays live until new version is ready

## 💰 Pricing

### Free Tier Limits
- **750 hours/month** of runtime
- **Sleeps after 15 minutes** of inactivity
- **Cold start delay** (~30 seconds)

### Paid Plans
- **$7/month**: Always-on, faster builds
- **Custom domains** and SSL included

## 🎉 Success!

Your Yamaha RD Parts Shop is now live on Render!

**Next Steps:**
1. **Test all functionality** on the live site
2. **Set up custom domain** (optional)
3. **Monitor performance** and logs
4. **Scale as needed**
