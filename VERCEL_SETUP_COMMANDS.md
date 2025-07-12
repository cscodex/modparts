# Vercel Setup Commands

## 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

## 2. Login to Vercel
```bash
vercel login
```

## 3. Deploy to Vercel
```bash
# Navigate to your project directory
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"

# Deploy to Vercel
vercel
```

## 4. Vercel Configuration Settings

When prompted during `vercel` command, use these settings:

- **Set up and deploy**: `Y`
- **Which scope**: Choose your account
- **Link to existing project**: `N` (for new deployment)
- **What's your project's name**: `yamaha-rd-parts-shop` (or your preferred name)
- **In which directory is your code located**: `./`
- **Want to override the settings**: `Y`

### Override Settings:
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Development Command**: `vite dev`

## 5. Set Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

```bash
# Go to your project dashboard on vercel.com
# Navigate to Settings > Environment Variables
# Add these variables:

SUPABASE_URL=https://uwizdypmlvfvegklnogq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aXpkeXBtbHZmdmVna2xub2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Mzk3MDUsImV4cCI6MjA2NjUxNTcwNX0.KQ3_XiXJERD7mA4iZOaon82hcR7g6PBigelW_rie7Ew
JWT_SECRET=cknBU1dk+r6v/xZojqR7fHOhDpBNltk6offArhevQpG7YS6AVio3n2iRD/ASCjAmSa/y9Rx1Z00IUxxvHUu58g==
```

## 6. Redeploy After Adding Environment Variables
```bash
vercel --prod
```

## 7. Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. Add environment variables in Settings
6. Deploy

## 8. Verify Deployment

After deployment, test these endpoints:
- `https://your-app.vercel.app/` - Frontend
- `https://your-app.vercel.app/api/products` - API test
- `https://your-app.vercel.app/api/auth/login` - Login API

## 9. Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add yourdomain.com
```

## 10. View Deployment Logs
```bash
vercel logs
```

## Troubleshooting Commands

```bash
# Check deployment status
vercel ls

# View project info
vercel inspect

# Remove deployment
vercel remove

# View help
vercel --help
```
