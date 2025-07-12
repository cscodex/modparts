<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include auth middleware
include_once 'middleware/auth.php';

// Define validateAdmin function if it doesn't exist
if (!function_exists('validateAdmin')) {
    function validateAdmin() {
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Check if user is logged in and is an admin
        if (isset($_SESSION['user_id']) && isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin') {
            return true;
        }

        // Check for token in Authorization header
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            $token = str_replace('Bearer ', '', $authHeader);

            // In a real app, you would validate the token and check if the user is an admin
            // For now, just assume the token is valid and the user is an admin
            if (!empty($token)) {
                return true;
            }
        }

        return false;
    }
}

// Check if user is admin
if (!validateAdmin()) {
    // Set response code - 403 Forbidden
    http_response_code(403);

    // Tell the user access denied
    echo json_encode(array("message" => "Access denied."));
    exit;
}

// Define upload directory with absolute path
$upload_dir = __DIR__ . '/uploads/';

// Create directory if it doesn't exist
if (!file_exists($upload_dir)) {
    error_log("Upload.php: Creating directory: $upload_dir");
    $result = mkdir($upload_dir, 0777, true);
    error_log("Upload.php: Directory creation result: " . ($result ? "Success" : "Failed"));
}

// Ensure directory has correct permissions
@chmod($upload_dir, 0777); // Suppress warnings with @ operator
error_log("Upload.php: Attempted to set permissions on directory: $upload_dir");

// Log request information for debugging
error_log("Upload.php: Request received");
error_log("Upload.php: FILES array: " . print_r($_FILES, true));

// Check if file was uploaded
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['image'];

    // Get file info
    $file_name = $file['name'];
    $file_tmp = $file['tmp_name'];
    $file_size = $file['size'];
    $file_error = $file['error'];

    error_log("Upload.php: File received - Name: $file_name, Size: $file_size bytes");

    // Get file extension
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

    // Allowed file extensions
    $allowed_ext = array('jpg', 'jpeg', 'png', 'gif');

    // Check if file extension is allowed
    if (in_array($file_ext, $allowed_ext)) {
        // Check file size (limit to 5MB)
        if ($file_size <= 5242880) {
            // Generate unique file name
            $new_file_name = uniqid('img_') . '.' . $file_ext;
            $file_destination = $upload_dir . $new_file_name;

            // Check if upload directory is writable
            if (!is_writable($upload_dir)) {
                error_log("Upload.php: Upload directory is not writable: $upload_dir");
                @chmod($upload_dir, 0777); // Suppress warnings with @ operator
                error_log("Upload.php: Attempted to change permissions on upload directory");
            }

            error_log("Upload.php: Attempting to move file from $file_tmp to $file_destination");

            // Move uploaded file to destination
            if (move_uploaded_file($file_tmp, $file_destination)) {
                error_log("Upload.php: File moved successfully");

                // Set response code - 201 Created
                http_response_code(201);

                // Get the server URL
                $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
                $host = $_SERVER['HTTP_HOST'];
                $base_url = $protocol . $host;

                // Get the base path of the application
                $script_name = $_SERVER['SCRIPT_NAME'];
                $base_path = dirname(dirname($script_name)); // Go up two levels from /api/upload.php

                // If we're in the root directory, base_path will be empty or '/'
                if ($base_path == '/' || empty($base_path)) {
                    $base_path = '';
                }

                // Create the full URL - use relative path from __DIR__ to create proper URL
                $relative_path = str_replace(__DIR__, '', $file_destination);
                $file_url = $base_url . $base_path . '/api' . $relative_path;

                // Log the path components for debugging
                error_log("Upload.php: Script name: " . $script_name);
                error_log("Upload.php: Base path: " . $base_path);

                error_log("Upload.php: Relative path: " . $relative_path);

                // Log the file path for debugging
                error_log("Upload.php: File uploaded to: " . $file_destination);
                error_log("Upload.php: Full URL: " . $file_url);

                // Check if file exists after upload
                if (file_exists($file_destination)) {
                    error_log("Upload.php: File exists at destination: " . $file_destination);
                    error_log("Upload.php: File size: " . filesize($file_destination) . " bytes");
                } else {
                    error_log("Upload.php: WARNING - File does not exist at destination after upload!");
                }

                // Return file URL
                echo json_encode(array(
                    "message" => "File uploaded successfully.",
                    "file_url" => $file_url
                ));
            } else {
                // Log the error
                error_log("Upload.php: Failed to move uploaded file. PHP error: " . error_get_last()['message']);

                // Set response code - 500 Internal Server Error
                http_response_code(500);

                // Tell the user
                echo json_encode(array("message" => "Failed to upload file."));
            }
        } else {
            // Set response code - 400 Bad Request
            http_response_code(400);

            // Tell the user
            echo json_encode(array("message" => "File size too large. Maximum size is 5MB."));
        }
    } else {
        // Set response code - 400 Bad Request
        http_response_code(400);

        // Tell the user
        echo json_encode(array("message" => "Invalid file type. Allowed types: jpg, jpeg, png, gif."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "No file uploaded or upload error."));
}
?>
