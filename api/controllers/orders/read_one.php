<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Include database, order model, and auth middleware
include_once '../../config/database.php';
include_once '../../models/Order.php';
include_once '../../middleware/auth.php';

// Check if user is authenticated
if (!validateToken()) {
    // Set response code - 401 Unauthorized
    http_response_code(401);

    // Tell the user access denied
    echo json_encode(array("message" => "Access denied."));
    exit;
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate order object
$order = new Order($db);

// Set ID property of record to read
$order->id = isset($_GET['id']) ? $_GET['id'] : die();

// Read the details of order
$order->readOne();

// Check if order exists
if ($order->id != null) {
    // Get user ID from session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Make sure we have a user ID and role
    if (!isset($_SESSION['user_id'])) {
        // For development, use a default user ID
        $_SESSION['user_id'] = 1;
        error_log("read_one: Created test user with ID: " . $_SESSION['user_id']);
    }

    if (!isset($_SESSION['user_role'])) {
        // For development, use a default user role
        $_SESSION['user_role'] = 'user';
        error_log("read_one: Set test user role to: " . $_SESSION['user_role']);
    }

    $user_id = $_SESSION['user_id'];
    $user_role = $_SESSION['user_role'];

    error_log("read_one: Using user ID: " . $user_id . ", role: " . $user_role);

    // Check if user is admin or the order belongs to the user
    if ($user_role === 'admin' || $order->user_id == $user_id) {
        // Create array
        $order_arr = array(
            "id" => $order->id,
            "user_id" => $order->user_id,
            "total_amount" => $order->total_amount,
            "status" => $order->status,
            "shipping_address" => $order->shipping_address,
            "payment_method" => $order->payment_method,
            "created_at" => $order->created_at,
            "items" => $order->items
        );

        // Set response code - 200 OK
        http_response_code(200);

        // Make it json format
        echo json_encode($order_arr);
    } else {
        // Set response code - 403 Forbidden
        http_response_code(403);

        // Tell the user access denied
        echo json_encode(array("message" => "Access denied."));
    }
} else {
    // Set response code - 404 Not found
    http_response_code(404);

    // Tell the user order does not exist
    echo json_encode(array("message" => "Order does not exist."));
}
?>
