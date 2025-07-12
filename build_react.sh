#!/bin/bash

# Script to build React app without restarting the server
# This script should be run after making changes to React files

echo "===== Modparts React Build Script ====="
echo "Starting React build process..."

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Define paths
PROJECT_ROOT="/Applications/XAMPP/xamppfiles/htdocs/Modparts"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
PUBLIC_DIR="$PROJECT_ROOT/public"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to build React app
build_react_app() {
  echo -e "\n${YELLOW}Building React application...${NC}"
  
  # Navigate to frontend directory
  cd "$FRONTEND_DIR" || {
    echo -e "${RED}Failed to navigate to frontend directory: $FRONTEND_DIR${NC}"
    return 1
  }
  
  # Check if npm is installed
  if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install Node.js and npm.${NC}"
    return 1
  fi
  
  # Install dependencies if node_modules doesn't exist
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
  fi
  
  # Build the React app
  echo -e "${YELLOW}Running build command...${NC}"
  npm run build
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}React build completed successfully!${NC}"
    return 0
  else
    echo -e "${RED}React build failed. Check for errors above.${NC}"
    return 1
  fi
}

# Function to ensure the build files are in the correct location
ensure_build_files() {
  echo -e "\n${YELLOW}Ensuring build files are in the correct location...${NC}"
  
  # Check if the public directory exists
  if [ ! -d "$PUBLIC_DIR" ]; then
    echo -e "${YELLOW}Public directory doesn't exist. Creating it...${NC}"
    mkdir -p "$PUBLIC_DIR"
  fi
  
  # Check if the build directory exists (in case vite.config.js is not set to output to public)
  if [ -d "$FRONTEND_DIR/dist" ] && [ ! -d "$PUBLIC_DIR/assets" ]; then
    echo -e "${YELLOW}Moving build files from dist to public directory...${NC}"
    cp -r "$FRONTEND_DIR/dist/"* "$PUBLIC_DIR/"
  fi
  
  # Check if index.html exists in the public directory
  if [ ! -f "$PUBLIC_DIR/index.html" ]; then
    echo -e "${RED}Build files not found in public directory. Check vite.config.js settings.${NC}"
    return 1
  fi
  
  echo -e "${GREEN}Build files are in the correct location!${NC}"
  return 0
}

# Function to create/update .htaccess file for proper routing
create_htaccess() {
  echo -e "\n${YELLOW}Creating/updating .htaccess file for React routing...${NC}"
  
  # Create .htaccess file in public directory
  cat > "$PUBLIC_DIR/.htaccess" << 'EOL'
# Enable rewriting
RewriteEngine On

# Set the base
RewriteBase /Modparts/

# If the request is not for a file or directory
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Rewrite all requests to the index.html
RewriteRule ^(.*)$ index.html [QSA,L]

# Set correct MIME types
AddType application/javascript .js
AddType application/json .json
AddType text/css .css
AddType image/svg+xml .svg

# Enable CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
EOL
  
  echo -e "${GREEN}.htaccess file created/updated!${NC}"
}

# Function to clear browser cache (instructions)
clear_browser_cache() {
  echo -e "\n${YELLOW}Browser Cache:${NC}"
  echo "To ensure all changes are visible, please clear your browser cache:"
  echo "  - Chrome: Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
  echo "  - Firefox: Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
  echo "  - Safari: Press Option+Cmd+E"
  echo "  - Edge: Press Ctrl+Shift+Delete"
}

# Main execution
echo -e "\n${YELLOW}Step 1: Building React application${NC}"
build_react_app || {
  echo -e "${RED}Failed to build React application. Exiting.${NC}"
  exit 1
}

echo -e "\n${YELLOW}Step 2: Ensuring build files are in the correct location${NC}"
ensure_build_files || {
  echo -e "${RED}Failed to ensure build files are in the correct location. Exiting.${NC}"
  exit 1
}

echo -e "\n${YELLOW}Step 3: Creating/updating .htaccess file${NC}"
create_htaccess

echo -e "\n${YELLOW}Step 4: Browser cache instructions${NC}"
clear_browser_cache

echo -e "\n${GREEN}===== React build process completed! =====\n${NC}"
echo "Your React changes should now be live. If you still don't see your changes:"
echo "1. Make sure you've cleared your browser cache"
echo "2. Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)"
echo "3. Check for any errors in the browser console"
echo "4. Verify that the build files are in the correct location"
echo -e "\n${YELLOW}Thank you for using the Modparts React build script!${NC}"
