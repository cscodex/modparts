#!/bin/bash

# Script to restart the server and make changes live
# This script should be run after making changes to the website

echo "===== Modparts Website Restart Script ====="
echo "Starting server restart process..."

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Define paths
XAMPP_CONTROL="/Applications/XAMPP/xamppfiles/xampp"
PROJECT_ROOT="/Applications/XAMPP/xamppfiles/htdocs/Modparts"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
API_DIR="$PROJECT_ROOT/api"

# Check if running as root/sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: This script may need to be run with sudo for some operations${NC}"
fi

# Function to restart Apache
restart_apache() {
  echo -e "\n${YELLOW}Restarting Apache server...${NC}"
  $XAMPP_CONTROL restart

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Apache server restarted successfully!${NC}"
  else
    echo -e "${RED}Failed to restart Apache server. Try running with sudo.${NC}"
    echo "You can manually restart using: sudo $XAMPP_CONTROL restart"
  fi
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

# Function to clear PHP opcache if enabled
clear_php_cache() {
  echo -e "\n${YELLOW}Clearing PHP cache...${NC}"

  # Create a simple PHP script to clear opcache
  TEMP_PHP_FILE="$PROJECT_ROOT/clear_cache.php"

  echo "<?php
  // Clear PHP opcache if enabled
  if(function_exists('opcache_reset')) {
    opcache_reset();
    echo 'PHP Opcache cleared successfully!';
  } else {
    echo 'PHP Opcache is not enabled.';
  }

  // Clear application cache
  if(file_exists('$FRONTEND_DIR/src/utils/cache.js')) {
    echo '\\nApplication cache control is available.';
  }
  ?>" > $TEMP_PHP_FILE

  # Execute the PHP script
  php $TEMP_PHP_FILE

  # Remove the temporary file
  rm $TEMP_PHP_FILE
}

# Function to ensure proper permissions
fix_permissions() {
  echo -e "\n${YELLOW}Setting correct permissions...${NC}"

  # Ensure uploads directory exists and has correct permissions
  if [ ! -d "$API_DIR/uploads" ]; then
    mkdir -p "$API_DIR/uploads"
    echo "Created uploads directory"
  fi

  chmod -R 777 "$API_DIR/uploads"
  echo "Set permissions for uploads directory"

  # Fix permissions for the entire project if needed
  $XAMPP_CONTROL fix_rights

  echo -e "${GREEN}Permissions updated!${NC}"
}

# Function to build and deploy React app
build_and_deploy_react() {
  echo -e "\n${YELLOW}Building and deploying React app...${NC}"

  # Check if the deploy_react.sh script exists
  if [ -f "$PROJECT_ROOT/deploy_react.sh" ]; then
    echo "Running React deployment script..."
    bash "$PROJECT_ROOT/deploy_react.sh"
    return $?
  else
    echo -e "${RED}React deployment script not found. Skipping React deployment.${NC}"
    return 1
  fi
}

# Main execution
echo -e "\n${YELLOW}Step 1: Fixing permissions${NC}"
fix_permissions

echo -e "\n${YELLOW}Step 2: Building and deploying React app${NC}"
build_and_deploy_react
REACT_DEPLOY_STATUS=$?

echo -e "\n${YELLOW}Step 3: Clearing PHP cache${NC}"
clear_php_cache

# Only restart Apache if we didn't already do it in the React deployment
if [ $REACT_DEPLOY_STATUS -ne 0 ]; then
  echo -e "\n${YELLOW}Step 4: Restarting Apache server${NC}"
  restart_apache
else
  echo -e "\n${YELLOW}Step 4: Apache already restarted during React deployment${NC}"
fi

echo -e "\n${YELLOW}Step 5: Browser cache instructions${NC}"
clear_browser_cache

echo -e "\n${GREEN}===== Server restart process completed! =====\n${NC}"
echo "Your changes should now be live. If you still don't see your changes:"
echo "1. Make sure you've cleared your browser cache"
echo "2. Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)"
echo "3. Check for any errors in the browser console"
echo "4. Check the Apache error logs at: /Applications/XAMPP/xamppfiles/logs/error_log"
echo -e "\n${YELLOW}Thank you for using the Modparts restart script!${NC}"
