<?php
// Include CORS headers
include_once __DIR__ . '/../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");

// Include database and models
include_once '../../config/database.php';
include_once '../../models/CartItem.php';
include_once '../../middleware/auth.php';

// Check if user is authenticated
if (!validateToken()) {
    // Set response code - 401 Unauthorized
    http_response_code(401);

    // Tell the user access denied
    echo json_encode(array("message" => "Access denied. User not authenticated."));
    exit;
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize cart item object
$cart_item = new CartItem($db);

// Get user ID from token validation
$headers = getallheaders();
$token = null;

// Check if Authorization header exists
if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
    $token = str_replace('Bearer ', '', $authHeader);
}

// Start session to get user ID
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if token is valid and matches session token
if (!$token || !isset($_SESSION['token']) || $_SESSION['token'] !== $token || !isset($_SESSION['user_id'])) {
    // Set response code - 401 Unauthorized
    http_response_code(401);

    // Tell the user access denied
    echo json_encode(array(
        "message" => "Access denied. Invalid or missing token.",
        "token_provided" => $token ? "Yes" : "No",
        "session_token_exists" => isset($_SESSION['token']) ? "Yes" : "No",
        "user_id_exists" => isset($_SESSION['user_id']) ? "Yes" : "No"
    ));
    exit;
}

$cart_item->user_id = $_SESSION['user_id'];

// Log the user ID for debugging
error_log("Clearing cart for user ID: " . $cart_item->user_id);

// Clear cart
if ($cart_item->clearCart()) {
    // Set response code - 200 OK
    http_response_code(200);

    // Tell the user
    echo json_encode(array("message" => "Cart cleared successfully."));
} else {
    // Set response code - 503 Service Unavailable
    http_response_code(503);

    // Tell the user
    echo json_encode(array("message" => "Unable to clear cart."));
}
?>
