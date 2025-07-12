# Git Deployment Commands

## 1. Initial Git Setup (if not already done)

### Check if Git is installed:
```bash
git --version
```

### Configure Git (if first time):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 2. Initialize Repository (if not already done)

```bash
# Navigate to project directory
cd "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"

# Initialize git repository
git init

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-repo-name.git
```

## 3. Prepare Files for Commit

### Check current status:
```bash
git status
```

### Add all files:
```bash
# Add all files to staging
git add .

# Or add specific files/folders:
git add api/
git add frontend/
git add package.json
git add vercel.json
git add .env.local
```

### Check what will be committed:
```bash
git status
git diff --cached
```

## 4. Commit Changes

```bash
# Commit with descriptive message
git commit -m "Restructure for Vercel deployment with Node.js/Supabase API

- Migrate from PHP/MySQL to Node.js/Supabase
- Add Vercel serverless functions in /api directory
- Update package.json with required dependencies
- Configure vercel.json for proper routing
- Fix authentication with bcrypt password hashing
- Add comprehensive API endpoints for products, cart, orders, admin
- Update frontend to work with new API structure
- Add environment configuration for both local and production"
```

## 5. Push to Repository

### Push to main branch:
```bash
# Push to main branch
git push origin main
```

### If this is the first push:
```bash
# Set upstream and push
git push -u origin main
```

### Force push (if needed to replace existing code):
```bash
# WARNING: This will overwrite existing repository content
git push origin main --force
```

## 6. Alternative: Replace Existing Repository

If you want to completely replace the existing codebase:

```bash
# Remove existing git history
rmdir /s .git

# Initialize fresh repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Complete rewrite: Vercel deployment with Node.js/Supabase"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-repo-name.git

# Force push to replace everything
git push origin main --force
```

## 7. Create .gitignore (if needed)

```bash
# Create .gitignore file
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo dist/ >> .gitignore
echo .vercel/ >> .gitignore
echo *.log >> .gitignore

# Add and commit .gitignore
git add .gitignore
git commit -m "Add .gitignore file"
git push origin main
```

## 8. Branch Management (Optional)

### Create development branch:
```bash
# Create and switch to development branch
git checkout -b development

# Push development branch
git push origin development
```

### Switch between branches:
```bash
# Switch to main
git checkout main

# Switch to development
git checkout development
```

## 9. Verify Repository

### Check remote repository:
```bash
git remote -v
```

### Check commit history:
```bash
git log --oneline
```

### Check current branch:
```bash
git branch
```

## 10. Connect to Vercel from Git

After pushing to Git, you can deploy to Vercel:

### Option A: Vercel CLI with Git
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to Git repository
vercel --prod
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from Git Repository
4. Select your repository
5. Configure build settings:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`

## 11. Post-Deployment Git Workflow

### For future updates:
```bash
# Make your changes
# ...

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to trigger automatic deployment
git push origin main
```

## 12. Troubleshooting Git Commands

### If you get authentication errors:
```bash
# Use personal access token instead of password
# Or configure SSH keys
```

### If you get merge conflicts:
```bash
# Pull latest changes first
git pull origin main

# Resolve conflicts manually
# Then commit and push
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Reset to last commit (if needed):
```bash
# Discard all local changes
git reset --hard HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
```

### View repository URL:
```bash
git config --get remote.origin.url
```

## 13. Quick Deployment Script

Create a batch file for quick Git deployment:

```batch
@echo off
echo Deploying to Git Repository...
cd /d "C:\Users\CHARANPREET\Downloads\modparts-main\modparts-main"

echo.
echo Adding files...
git add .

echo.
echo Committing changes...
set /p message="Enter commit message: "
git commit -m "%message%"

echo.
echo Pushing to repository...
git push origin main

echo.
echo Deployment complete!
pause
```

Save this as `deploy-to-git.bat` and run it for quick deployments.
