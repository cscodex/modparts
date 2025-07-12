<?php
// Include CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and auth middleware
include_once '../../config/database.php';
include_once '../../middleware/auth.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is admin
if (!validateAdmin()) {
    // Set response code - 401 Unauthorized
    http_response_code(401);
    
    // Tell the user access denied
    echo json_encode(array("message" => "Access denied. Admin privileges required."));
    exit;
}

// Get the PHP error log path
$error_log_path = ini_get('error_log');

// If error_log path is not set, try common locations
if (empty($error_log_path) || !file_exists($error_log_path)) {
    // Try common locations for XAMPP
    $possible_paths = array(
        '/Applications/XAMPP/xamppfiles/logs/php_error_log',
        '/Applications/XAMPP/logs/php_error_log',
        '/xampp/logs/php_error_log',
        'C:/xampp/logs/php_error_log',
        'C:/xampp/php/logs/php_error_log',
        '/var/log/apache2/error.log',
        '/var/log/httpd/error_log'
    );
    
    foreach ($possible_paths as $path) {
        if (file_exists($path)) {
            $error_log_path = $path;
            break;
        }
    }
}

// Function to get the last N lines of a file
function tail($filename, $lines = 100) {
    $file = @fopen($filename, "r");
    if (!$file) {
        return array();
    }
    
    $buffer = 4096;
    $lines_array = array();
    
    // Jump to the end of the file
    fseek($file, 0, SEEK_END);
    $pos = ftell($file);
    
    // Start reading from the end of the file
    $chunk = "";
    $line_count = 0;
    
    while ($pos > 0 && $line_count < $lines) {
        // Calculate how many bytes to read
        $read_size = min($buffer, $pos);
        $pos -= $read_size;
        
        // Read the chunk
        fseek($file, $pos, SEEK_SET);
        $chunk = fread($file, $read_size) . $chunk;
        
        // Count the lines in the chunk
        $chunk_lines = explode("\n", $chunk);
        $chunk_line_count = count($chunk_lines) - 1;
        
        // If we have more lines than needed, trim the chunk
        if ($line_count + $chunk_line_count >= $lines) {
            $start_index = $chunk_line_count - ($lines - $line_count);
            $lines_array = array_merge(array_slice($chunk_lines, $start_index), $lines_array);
            break;
        }
        
        // Otherwise, add all lines from the chunk
        $lines_array = array_merge($chunk_lines, $lines_array);
        $line_count += $chunk_line_count;
        
        // If we've reached the beginning of the file, break
        if ($pos === 0) {
            break;
        }
    }
    
    fclose($file);
    
    // Remove empty lines
    return array_filter($lines_array, function($line) {
        return !empty(trim($line));
    });
}

// Get the logs
$logs = array();

if (!empty($error_log_path) && file_exists($error_log_path)) {
    // Get the last 500 lines of the error log
    $logs = tail($error_log_path, 500);
    
    // Filter logs to only include those related to cart operations
    $filtered_logs = array();
    foreach ($logs as $log) {
        if (strpos($log, 'CartItem') !== false || 
            strpos($log, 'cart') !== false || 
            strpos($log, 'Cart') !== false ||
            strpos($log, 'SESSION') !== false ||
            strpos($log, 'SQL') !== false ||
            strpos($log, 'Database') !== false) {
            $filtered_logs[] = $log;
        }
    }
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Return the logs
    echo json_encode(array(
        "message" => "Logs retrieved successfully",
        "log_path" => $error_log_path,
        "logs" => $filtered_logs
    ));
} else {
    // Set response code - 404 Not Found
    http_response_code(404);
    
    // Tell the user no logs found
    echo json_encode(array(
        "message" => "No error logs found",
        "checked_paths" => $possible_paths
    ));
}
?>
