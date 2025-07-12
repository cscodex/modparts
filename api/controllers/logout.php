<?php
// Include CORS headers
include_once '../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");

// Start session
session_start();

// Destroy session
session_destroy();

// Set response code - 200 OK
http_response_code(200);

// Tell the user
echo json_encode(array("message" => "Logged out successfully."));
?>
