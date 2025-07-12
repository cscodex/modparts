# Deployment Guide: Yamaha RD Parts Shop to Vercel with Supabase

This guide will help you deploy the Yamaha RD Parts Shop application to Vercel with Supabase as the database.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Step 1: Set Up Supabase Database

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: "yamaha-rd-parts"
   - Set a strong database password
   - Choose a region close to your users

2. **Set up the database schema**:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to execute the SQL

3. **Get your Supabase credentials**:
   - Go to Settings > API
   - Copy the following values:
     - Project URL
     - Anon (public) key
     - Service role key (keep this secret!)

## Step 2: Prepare Your Code

1. **Install dependencies**:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Update environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     JWT_SECRET=your_random_jwt_secret
     ```

3. **Test locally**:
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Test login with: admin@yamahaparts.com / admin123

## Step 3: Deploy to Vercel

1. **Connect your repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure build settings**:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `public`
   - Install Command: `npm install`

3. **Set environment variables in Vercel**:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     JWT_SECRET=your_random_jwt_secret
     NODE_ENV=production
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at your Vercel URL

## Step 4: Configure Domain (Optional)

1. **Add custom domain**:
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions

## Step 5: Test Your Deployment

1. **Test the application**:
   - Visit your Vercel URL
   - Test user registration and login
   - Test product browsing
   - Test admin functionality with admin@yamahaparts.com / admin123

2. **Monitor logs**:
   - Check Vercel function logs for any errors
   - Check Supabase logs for database issues

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure your Vercel domain is added to Supabase allowed origins
   - Check that API endpoints have proper CORS headers

2. **Database Connection Issues**:
   - Verify Supabase credentials are correct
   - Check that RLS policies are properly configured

3. **Build Failures**:
   - Check that all dependencies are listed in package.json
   - Verify build command is correct

4. **API Route Issues**:
   - Ensure API routes are in the `/api` directory
   - Check that serverless functions are properly configured

### Environment Variables:

Make sure these are set in both local development and Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NODE_ENV`

## Security Notes

1. **Never commit sensitive environment variables** to your repository
2. **Use strong passwords** for your Supabase database
3. **Regularly rotate your JWT secret** in production
4. **Enable Row Level Security** in Supabase (already configured in the schema)
5. **Monitor your Supabase usage** to prevent abuse

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Check the Supabase logs
3. Verify all environment variables are set correctly
4. Ensure your database schema is properly set up
