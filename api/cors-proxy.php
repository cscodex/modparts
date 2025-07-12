<?php
// Set a single Access-Control-Allow-Origin header
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the target URL from the query parameter
$target_url = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($target_url)) {
    http_response_code(400);
    echo json_encode(array("message" => "No target URL specified."));
    exit;
}

// Construct the full URL
$full_url = "http://localhost/Modparts/api/" . $target_url;

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the request body for POST, PUT requests
$request_body = file_get_contents('php://input');

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $full_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Set request body for POST, PUT requests
if ($method === 'POST' || $method === 'PUT') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request_body);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
}

// Execute cURL request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Close cURL
curl_close($ch);

// Set response code
http_response_code($http_code);

// Return the response
echo $response;
?>
