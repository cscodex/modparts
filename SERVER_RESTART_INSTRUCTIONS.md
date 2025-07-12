# Modparts Server Restart Instructions

This document provides instructions on how to restart the server and make your changes live when you update the website code.

## Why Restart the Server?

When you make changes to PHP files or server configurations, you need to restart the server for those changes to take effect. Additionally, clearing caches ensures that your browser and the server are using the most up-to-date versions of your files.

## React Changes

The restart process now includes building and deploying your React application. This means:

1. Your React code will be compiled and optimized
2. The build files will be placed in the correct location for the web server
3. The necessary configuration files (.htaccess) will be created or updated

This ensures that any changes you make to React components, styles, or other frontend code will be properly reflected in the application.

## Methods to Restart the Server

### Method 1: Using the Admin Dashboard (Recommended)

1. Log in as an admin user
2. Go to the Admin Dashboard
3. Click the "Restart Server" button in the top-right corner
4. Follow the instructions on the restart page

### Method 2: Using the Restart Page Directly

1. Navigate to `/Modparts/restart.php` in your browser
2. Log in as an admin if prompted
3. Click the "Restart Server" button

### Method 3: Using the Command Line

If you have terminal access to the server, you can run:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Modparts
bash restart_server.sh
```

Or with sudo if needed:

```bash
sudo bash /Applications/XAMPP/xamppfiles/htdocs/Modparts/restart_server.sh
```

## Clearing Browser Cache

Sometimes your browser may cache old versions of files. To ensure you're seeing the latest changes:

1. **Hard Refresh**: Press Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear Browser Cache**:
   - Chrome: Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Firefox: Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Safari: Press Option+Cmd+E
   - Edge: Press Ctrl+Shift+Delete

## Troubleshooting

If you're still not seeing your changes after restarting:

1. Check the Apache error logs at: `/Applications/XAMPP/xamppfiles/logs/error_log`
2. Make sure your PHP files don't have syntax errors
3. Check file permissions (files should be readable by the web server)
4. Try restarting XAMPP completely using the XAMPP Control Panel

### React-Specific Troubleshooting

If your React changes aren't appearing:

1. Check the browser console for JavaScript errors
2. Verify that the build process completed successfully (check the output of the restart script)
3. Make sure the build files are in the correct location (`/Applications/XAMPP/xamppfiles/htdocs/Modparts/public`)
4. Check that the .htaccess file is properly configured for routing
5. Try running the React build process manually:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/Modparts/frontend
   npm run build
   ```
6. Verify that your vite.config.js is correctly configured to output to the public directory

## Security Note

The restart functionality should only be accessible to admin users. In a production environment, you might want to implement additional security measures or remove the restart.php file entirely and use only command-line methods.

## Additional Resources

- XAMPP Documentation: https://www.apachefriends.org/docs/
- Apache Documentation: https://httpd.apache.org/docs/
- PHP Documentation: https://www.php.net/docs.php
