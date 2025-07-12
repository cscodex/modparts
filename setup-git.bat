@echo off
echo Setting up Git repository for Yamaha RD Parts Shop...

echo.
echo 1. Initializing Git repository...
git init

echo.
echo 2. Creating .gitignore file...
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo dist/ >> .gitignore
echo *.log >> .gitignore
echo temp-cart-storage.json >> .gitignore
echo .vercel/ >> .gitignore

echo.
echo 3. Adding all files...
git add .

echo.
echo 4. Creating initial commit...
git commit -m "Initial commit: Yamaha RD Parts Shop with Node.js/Supabase"

echo.
echo 5. Setting main branch...
git branch -M main

echo.
echo ✅ Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Create a repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo.
pause
