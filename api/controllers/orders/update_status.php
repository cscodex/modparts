<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database, order model, and auth middleware
include_once '../../config/database.php';
include_once '../../models/Order.php';
include_once '../../middleware/auth.php';

// Check if user is admin
if (!validateAdmin()) {
    // Set response code - 403 Forbidden
    http_response_code(403);
    
    // Tell the user access denied
    echo json_encode(array("message" => "Access denied."));
    exit;
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate order object
$order = new Order($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (!empty($data->id) && !empty($data->status)) {
    // Set order property values
    $order->id = $data->id;
    $order->status = $data->status;

    // Update the order status
    if ($order->updateStatus()) {
        // Set response code - 200 OK
        http_response_code(200);

        // Tell the user
        echo json_encode(array("message" => "Order status was updated."));
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to update order status."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to update order status. Data is incomplete."));
}
?>
