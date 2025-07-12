<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include the response helper
include_once __DIR__ . '/includes/response.php';

// Get the requested URL from the path info
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api/';
$path = '';

// Extract the path after the base path
if (strpos($request_uri, $base_path) === 0) {
    $path = substr($request_uri, strlen($base_path));
} else {
    // Fallback to the url parameter
    $path = isset($_GET['url']) ? $_GET['url'] : '';
}

// Debug information
error_log("Request URI: " . $request_uri);
error_log("Base Path: " . $base_path);
error_log("Extracted Path: " . $path);

// Route the request to the appropriate controller
if (!empty($path)) {
    // Check if the path is for a controller
    if (strpos($path, 'controllers/') === 0) {
        $file_path = __DIR__ . '/' . $path;
        error_log("Looking for controller at: " . $file_path);

        if (file_exists($file_path)) {
            include_once $file_path;
        } else {
            send_json_response(404, ["message" => "Endpoint not found: " . $path]);
        }
    } else {
        // Try to find a controller that matches
        $controller_path = __DIR__ . '/controllers/' . $path . '.php';
        error_log("Looking for controller at: " . $controller_path);

        if (file_exists($controller_path)) {
            include_once $controller_path;
        } else {
            send_json_response(404, ["message" => "Endpoint not found: " . $path]);
        }
    }
} else {
    // No path specified, check if this is a direct request to a controller
    $direct_path = $_SERVER['SCRIPT_FILENAME'];
    $filename = basename($direct_path);

    if ($filename !== 'index.php') {
        // This is a direct request to a controller
        include_once $direct_path;
    } else {
        send_json_response(404, ["message" => "No endpoint specified."]);
    }
}
?>
