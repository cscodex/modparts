# Deployment Checklist for Yamaha RD Parts Shop

## ✅ Pre-Deployment Setup

### 1. Supabase Database Setup
- [ ] Create Supabase project
- [ ] Run the SQL schema from `supabase-schema.sql`
- [ ] Verify tables are created correctly
- [ ] Test admin login: admin@yamahaparts.com / admin123
- [ ] Configure Row Level Security policies
- [ ] Get Supabase URL and API keys

### 2. Environment Variables
- [ ] Copy `.env.example` to `.env.local` for local development
- [ ] Fill in Supabase credentials in `.env.local`
- [ ] Generate a strong JWT secret
- [ ] Test local development setup

### 3. Code Preparation
- [ ] All API endpoints migrated to Node.js
- [ ] Frontend updated to use new API structure
- [ ] Dependencies installed and working
- [ ] Build process tested locally

## 🚀 Vercel Deployment

### 1. Repository Setup
- [ ] Code pushed to Git repository (GitHub, GitLab, etc.)
- [ ] Repository is public or accessible to Vercel
- [ ] All sensitive files are in .gitignore

### 2. Vercel Project Setup
- [ ] Connect repository to Vercel
- [ ] Configure build settings:
  - Build Command: `npm run vercel-build`
  - Output Directory: `public`
  - Install Command: `npm install`

### 3. Environment Variables in Vercel
Set these in Vercel project settings:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `JWT_SECRET`
- [ ] `NODE_ENV=production`

### 4. Deploy
- [ ] Trigger deployment
- [ ] Monitor build logs for errors
- [ ] Verify deployment success

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Website loads correctly
- [ ] API endpoints respond
- [ ] Database connection works

### 2. User Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works (admin@yamahaparts.com / admin123)
- [ ] JWT tokens are generated correctly

### 3. Core Features
- [ ] Product browsing works
- [ ] Category filtering works
- [ ] Cart functionality works
- [ ] Order creation works
- [ ] Admin dashboard accessible

### 4. Error Handling
- [ ] 404 pages work correctly
- [ ] API error responses are proper
- [ ] CORS headers are set correctly

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check package.json dependencies
   - Verify build command is correct
   - Check for syntax errors in code

2. **API Errors**
   - Verify environment variables are set
   - Check Supabase connection
   - Review function logs in Vercel

3. **Database Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure schema is properly set up

4. **CORS Errors**
   - Verify API endpoints have CORS headers
   - Check frontend API configuration

## 📝 Final Steps

- [ ] Update DNS settings (if using custom domain)
- [ ] Set up monitoring and alerts
- [ ] Document any custom configurations
- [ ] Share deployment URL with stakeholders
- [ ] Set up backup procedures for database

## 🔒 Security Checklist

- [ ] Environment variables are secure
- [ ] No sensitive data in repository
- [ ] Supabase RLS policies are enabled
- [ ] JWT secret is strong and unique
- [ ] Admin credentials are changed from defaults
- [ ] HTTPS is enforced

## 📊 Performance Optimization

- [ ] Images are optimized
- [ ] Static assets are cached
- [ ] Database queries are optimized
- [ ] API responses are efficient

---

**Note**: Keep this checklist updated as you deploy and make changes to the application.
