<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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

// Query orders
$stmt = $order->read();
$num = $stmt->rowCount();

// Check if more than 0 record found
if ($num > 0) {
    // Orders array
    $orders_arr = array();
    $orders_arr["records"] = array();

    // Retrieve table contents
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $order_item = array(
            "id" => $id,
            "user_id" => $user_id,
            "email" => $email,
            "customer_name" => $first_name . " " . $last_name,
            "total_amount" => $total_amount,
            "status" => $status,
            "shipping_address" => $shipping_address,
            "payment_method" => $payment_method,
            "created_at" => $created_at
        );

        array_push($orders_arr["records"], $order_item);
    }

    // Set response code - 200 OK
    http_response_code(200);

    // Show orders data
    echo json_encode($orders_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);

    // Tell the user no orders found
    echo json_encode(array("message" => "No orders found."));
}
?>
