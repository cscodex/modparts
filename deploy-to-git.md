# Git Deployment Commands

## Current Status
✅ **Project restructured for Vercel deployment**
✅ **API endpoints moved to `/api/` folder**
✅ **Root package.json updated with dependencies**
✅ **vercel.json configured properly**

## Files Ready for Deployment

### New Structure:
```
/
├── api/                    # Vercel serverless functions
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── admin/
│   │   ├── users.js
│   │   ├── dashboard.js
│   │   └── orders.js
│   ├── products/
│   │   ├── index.js
│   │   └── [id].js
│   ├── cart/
│   │   └── index.js
│   ├── categories/
│   │   └── index.js
│   ├── orders/
│   │   └── index.js
│   └── upload/
│       └── index.js
├── frontend/               # React application
├── package.json           # Root dependencies for API
├── vercel.json            # Vercel configuration
└── .env.local             # Environment variables
```

## Git Commands to Push

```bash
# 1. Add all files
git add .

# 2. Commit with message
git commit -m "Restructure for Vercel deployment with Node.js/Supabase API"

# 3. Push to your repository
git push origin main
```

## Vercel Deployment Settings

When you connect to Vercel, use these settings:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Environment Variables for Vercel

Add these in Vercel dashboard:

```
SUPABASE_URL=https://uwizdypmlvfvegklnogq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aXpkeXBtbHZmdmVna2xub2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Mzk3MDUsImV4cCI6MjA2NjUxNTcwNX0.KQ3_XiXJERD7mA4iZOaon82hcR7g6PBigelW_rie7Ew
JWT_SECRET=cknBU1dk+r6v/xZojqR7fHOhDpBNltk6offArhevQpG7YS6AVio3n2iRD/ASCjAmSa/y9Rx1Z00IUxxvHUu58g==
```

## After Deployment

1. **Test the deployed app**
2. **Register a new user** (since login is having issues locally)
3. **Test admin functionality** with: admin@yamahaparts.com / admin123

## Login Issue Fix

The current login error is because the user `charan881130@gmail.com` either:
1. Doesn't exist in the database
2. Has a null password hash

**Solution**: After deployment, go to the registration page and create the user account first, then try logging in.

## Next Steps

1. Run the git commands above
2. Connect to Vercel and deploy
3. Add environment variables
4. Test the deployed application
5. Register your user account on the deployed app
