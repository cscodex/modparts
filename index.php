<?php
// Debug information
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];

// Handle asset requests
if (strpos($request_uri, '/assets/') !== false || strpos($request_uri, 'vite.svg') !== false) {
    // Clean up the request URI
    $clean_uri = str_replace('/Modparts', '', $request_uri);

    // Check multiple possible locations for assets
    $possible_paths = [
        __DIR__ . '/public' . $clean_uri,  // Check public directory first (where we copied assets)
        __DIR__ . '/public/assets/' . basename($clean_uri),  // Try just the filename in public/assets
        __DIR__ . '/public/assets/app.js',  // Try the main app.js file
        __DIR__ . '/public/assets/index.js',  // Try index.js
        __DIR__ . '/public/assets/main.js',  // Try main.js
        __DIR__ . '/public/assets/' . str_replace('.js', '-*.js', basename($clean_uri)),  // Try with hash
        __DIR__ . $clean_uri,  // Try direct path
        __DIR__ . '/frontend/dist/assets/' . basename($clean_uri)  // Fallback to dist directory
    ];

    // Debug asset paths
    error_log("Looking for asset: " . $request_uri);
    error_log("Cleaned URI: " . $clean_uri);
    error_log("Possible paths: " . print_r($possible_paths, true));

    $asset_found = false;
    $asset_path = '';

    foreach ($possible_paths as $path) {
        error_log("Checking path: " . $path);
        if (file_exists($path)) {
            $asset_found = true;
            $asset_path = $path;
            error_log("Asset found at: " . $path);
            break;
        }
    }

    if ($asset_found) {
        // Determine content type
        $extension = pathinfo($asset_path, PATHINFO_EXTENSION);
        $contentTypes = [
            'js' => 'application/javascript; charset=utf-8',
            'mjs' => 'application/javascript; charset=utf-8',
            'css' => 'text/css; charset=utf-8',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'ttf' => 'font/ttf',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2'
        ];

        if (isset($contentTypes[$extension])) {
            header('Content-Type: ' . $contentTypes[$extension]);

            // Add cache headers - use shorter cache time for JavaScript files
            if ($extension === 'js' || $extension === 'mjs') {
                header('Cache-Control: no-cache, must-revalidate');
                header('Pragma: no-cache');
                header('Expires: 0');
            } else {
                header('Cache-Control: max-age=86400'); // 1 day for other assets
            }

            // Add CORS headers for JavaScript files
            if ($extension === 'js' || $extension === 'mjs') {
                header('Access-Control-Allow-Origin: *');
                header('X-Content-Type-Options: nosniff');
            }
        }

        readfile($asset_path);
        exit;
    } else {
        header('HTTP/1.1 404 Not Found');
        echo "Asset not found: " . htmlspecialchars($request_uri) . "<br>";
        echo "Checked paths:<br>";
        echo "<pre>" . print_r($possible_paths, true) . "</pre>";
        exit;
    }
}

// Check if this is an API request
if (strpos($request_uri, '/api/') === 0) {
    // Forward to the API endpoint
    include __DIR__ . '/api/index.php';
    exit;
}

// For all other requests, serve the React app
// This allows React Router to handle client-side routing
header('Content-Type: text/html; charset=utf-8');

// Read the built index.html file
$indexPath = __DIR__ . '/public/index.html';
if (file_exists($indexPath)) {
    // Read the file content
    $content = file_get_contents($indexPath);

    // Generate a cache-busting version parameter
    $version = time();

    // Fix any paths if needed and add version parameter to JavaScript files
    $content = str_replace('/Modparts/assets/', '/Modparts/public/assets/', $content);

    // Add version parameter to JavaScript files
    $content = preg_replace('/(src="[^"]+\.js)(")/i', '$1?v=' . $version . '$2', $content);

    echo $content;
} else {
    // Fallback if the built index.html doesn't exist
    echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Yamaha RD Parts Shop</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .error { color: red; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Yamaha RD Parts Shop</h1>
    <div class='error'>
        <p>The application is not properly built. Please run the build process for the frontend.</p>
        <p>Error: Could not find the built index.html file at: $indexPath</p>
    </div>
</body>
</html>";
}
?>
