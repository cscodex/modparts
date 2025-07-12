#!/bin/bash

# Script to build and deploy React app to XAMPP server
# This script should be run after making changes to React files

echo "===== Modparts React Deployment Script ====="
echo "Starting React build and deployment process..."

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Define paths
PROJECT_ROOT="/Applications/XAMPP/xamppfiles/htdocs/Modparts"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
PUBLIC_DIR="$PROJECT_ROOT/public"
XAMPP_DIR="/Applications/XAMPP/xamppfiles"

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

# Function to restart Apache server
restart_apache() {
  echo -e "\n${YELLOW}Restarting Apache server...${NC}"
  "$XAMPP_DIR/xampp" restart
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Apache server restarted successfully!${NC}"
  else
    echo -e "${RED}Failed to restart Apache server. Try running with sudo.${NC}"
    echo "You can manually restart using: sudo $XAMPP_DIR/xampp restart"
  fi
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

echo -e "\n${YELLOW}Step 4: Restarting Apache server${NC}"
restart_apache

echo -e "\n${GREEN}===== React deployment completed! =====\n${NC}"
echo "Your React application should now be accessible at: http://localhost/Modparts/"
echo "If you encounter any issues:"
echo "1. Check the browser console for errors"
echo "2. Verify that the build files are in the correct location"
echo "3. Check the Apache error logs at: $XAMPP_DIR/logs/error_log"
echo -e "\n${YELLOW}Thank you for using the Modparts React deployment script!${NC}"
  