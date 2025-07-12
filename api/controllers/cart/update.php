<?php
// Include CORS headers
include_once __DIR__ . '/../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");

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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (
    !empty($data->id) &&
    !empty($data->quantity)
) {
    // Set cart item properties
    $cart_item->id = $data->id;

    // Update quantity
    if ($cart_item->updateQuantity($data->quantity)) {
        // Set response code - 200 OK
        http_response_code(200);

        // Tell the user
        echo json_encode(array("message" => "Cart item quantity updated successfully."));
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to update cart item quantity."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to update cart item. Data is incomplete."));
}
?>
