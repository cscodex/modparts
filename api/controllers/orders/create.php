<?php
// Include CORS headers
include_once __DIR__ . '/../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Include database, order model, and auth middleware
include_once '../../config/database.php';
include_once '../../models/Order.php';
include_once '../../middleware/auth.php';

// Check if user is authenticated
if (!validateToken()) {
    // For development, create a test user session if it doesn't exist
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        $_SESSION['user_id'] = 1; // Use ID 1 for testing
        $_SESSION['user_role'] = 'user';
        $_SESSION['email'] = 'test@example.com';
        $_SESSION['token'] = 'test_token_123';
        error_log("Order Create: Created test user session for development");
    } else {
        error_log("Order Create: Using existing user session: " . $_SESSION['user_id']);
    }
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate order object
$order = new Order($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (
    !empty($data->items) &&
    !empty($data->total_amount) &&
    !empty($data->shipping_address) &&
    !empty($data->payment_method)
) {
    // Get user ID from session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Log session data for debugging
    error_log("Order Create: Session data: " . print_r($_SESSION, true));
    error_log("Order Create: Session ID: " . session_id());

    // Get token from Authorization header
    $headers = getallheaders();
    $token = null;
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        $token = str_replace('Bearer ', '', $authHeader);
        error_log("Order Create: Token from Authorization header: " . $token);
    }

    // Try to get user ID from multiple sources
    $user_id = null;

    // 1. Try session first
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];
        error_log("Order Create: Using user ID from session: " . $user_id);
    }
    // 2. If not in session, try to get from token (in a real app, you would decode the JWT)
    else if ($token) {
        // For development, use a default user ID
        $user_id = 1;
        error_log("Order Create: Using default user ID (1) since token is present but user_id not in session");
    }
    // 3. Last resort, use a default user ID for development
    else {
        $user_id = 1;
        error_log("Order Create: Using default user ID (1) as fallback");

        // Store in session for future requests
        $_SESSION['user_id'] = $user_id;
        $_SESSION['user_role'] = 'user';
    }

    if (!$user_id) {
        // Set response code - 401 Unauthorized
        http_response_code(401);

        // Tell the user
        echo json_encode(array("message" => "User ID not found in session or token."));
        exit;
    }

    // Set order property values
    $order->user_id = $user_id;
    $order->total_amount = $data->total_amount;
    $order->status = "pending";
    $order->shipping_address = $data->shipping_address;
    $order->payment_method = $data->payment_method;
    $order->items = $data->items;

    // Log order creation attempt
    error_log("=== ORDER CREATION ATTEMPT ===");
    error_log("User ID: " . $order->user_id);
    error_log("Total Amount: " . $order->total_amount);
    error_log("Shipping Address: " . $order->shipping_address);
    error_log("Payment Method: " . $order->payment_method);
    error_log("Number of Items: " . count($order->items));
    error_log("Session ID: " . session_id());

    // Create the order
    if ($order->create()) {
        // Log success
        error_log("Order created successfully with ID: " . $order->id);

        // Set response code - 201 Created
        http_response_code(201);

        // Tell the user
        echo json_encode(array(
            "message" => "Order was created.",
            "order_id" => $order->id
        ));
    } else {
        // Log failure
        error_log("Failed to create order");

        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to create order."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to create order. Data is incomplete."));
}
?>
