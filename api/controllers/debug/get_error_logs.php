<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and auth middleware
include_once '../../config/database.php';
include_once '../../middleware/auth.php';

// Check if user is admin
if (!validateAdmin()) {
    // Set response code - 401 Unauthorized
    http_response_code(401);
    
    // Tell the user access denied
    echo json_encode(array("message" => "Access denied. Admin privileges required."));
    exit;
}

// Function to get the last n lines of a file
function tail($filepath, $lines = 1000) {
    $file = new SplFileObject($filepath, 'r');
    $file->seek(PHP_INT_MAX);
    $last_line = $file->key();
    
    $offset = max(0, $last_line - $lines);
    $file->seek($offset);
    
    $logs = array();
    while (!$file->eof()) {
        $line = $file->fgets();
        if (trim($line) !== '') {
            $logs[] = $line;
        }
    }
    
    return $logs;
}

// Try to get the error log path
$error_log_path = ini_get('error_log');

// If error_log is not set, try common locations
if (empty($error_log_path) || !file_exists($error_log_path)) {
    $possible_paths = array(
        '/var/log/apache2/error.log',
        '/var/log/httpd/error_log',
        '/var/log/php_errors.log',
        $_SERVER['DOCUMENT_ROOT'] . '/../logs/error.log',
        $_SERVER['DOCUMENT_ROOT'] . '/error_log',
        $_SERVER['DOCUMENT_ROOT'] . '/php_error.log'
    );
    
    foreach ($possible_paths as $path) {
        if (file_exists($path)) {
            $error_log_path = $path;
            break;
        }
    }
}

if (!empty($error_log_path) && file_exists($error_log_path)) {
    // Get the last 1000 lines of the error log
    $logs = tail($error_log_path, 1000);
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Return the logs
    echo json_encode(array(
        "message" => "Error logs retrieved successfully",
        "log_path" => $error_log_path,
        "logs" => $logs
    ));
} else {
    // Set response code - 404 Not Found
    http_response_code(404);
    
    // Tell the user no logs found
    echo json_encode(array(
        "message" => "Error log file not found",
        "possible_paths" => $possible_paths
    ));
}
?>