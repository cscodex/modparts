<?php
// Include CORS headers
include_once __DIR__ . '/../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

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
error_log("Importing cart for user ID: " . $cart_item->user_id);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (!empty($data->items) && is_array($data->items)) {
    // Clear existing cart first
    $cart_item->clearCart();

    $success_count = 0;
    $error_count = 0;

    // Add each item to the cart
    foreach ($data->items as $item) {
        if (!empty($item->product_id) && !empty($item->quantity)) {
            $cart_item->product_id = $item->product_id;
            $cart_item->quantity = $item->quantity;

            // Check if product is in stock
            if ($cart_item->checkStock()) {
                if ($cart_item->addToCart()) {
                    $success_count++;
                } else {
                    $error_count++;
                }
            } else {
                $error_count++;
            }
        }
    }

    // Set response code - 200 OK
    http_response_code(200);

    // Tell the user
    echo json_encode(array(
        "message" => "Cart imported successfully.",
        "success_count" => $success_count,
        "error_count" => $error_count
    ));
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to import cart. Data is incomplete or invalid."));
}
?>
