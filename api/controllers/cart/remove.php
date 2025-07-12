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

// Log the user ID for debugging
error_log("Removing cart item for user ID: " . $_SESSION['user_id']);

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize cart item object
$cart_item = new CartItem($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (!empty($data->id)) {
    // Set cart item ID
    $cart_item->id = $data->id;

    // Remove from cart
    if ($cart_item->removeFromCart()) {
        // Set response code - 200 OK
        http_response_code(200);

        // Tell the user
        echo json_encode(array("message" => "Item removed from cart successfully."));
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to remove item from cart."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to remove item from cart. Data is incomplete."));
}
?>
