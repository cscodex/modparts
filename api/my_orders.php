<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and order model
include_once 'config/database.php';
include_once 'models/Order.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Log session data for debugging
error_log("my_orders.php: Session ID: " . session_id());
error_log("my_orders.php: Session data: " . print_r($_SESSION, true));

// Get token from Authorization header
$headers = getallheaders();
$token = null;
if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
    $token = str_replace('Bearer ', '', $authHeader);
    error_log("my_orders.php: Token from Authorization header: " . $token);
}

// Try to get user ID from multiple sources
$user_id = null;

// 1. Try session first
if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    error_log("my_orders.php: Using user ID from session: " . $user_id);
}
// 2. If not in session, try to get from token (in a real app, you would decode the JWT)
else if ($token) {
    // For development, use a default user ID
    $user_id = 1;
    error_log("my_orders.php: Using default user ID (1) since token is present but user_id not in session");

    // Store in session for future requests
    $_SESSION['user_id'] = $user_id;
}
// 3. Last resort, use a default user ID for development
else {
    $user_id = 1;
    error_log("my_orders.php: Using default user ID (1) as fallback");

    // Store in session for future requests
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_role'] = 'user';
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate order object
$order = new Order($db);

// Set user ID
$order->user_id = $user_id;
error_log("my_orders.php: Using user ID: " . $order->user_id);

// Check if a specific order ID is requested
if (isset($_GET['id'])) {
    $order_id = $_GET['id'];
    error_log("my_orders.php: Fetching single order with ID: " . $order_id);

    try {
        // Set the order ID
        $order->id = $order_id;

        // Get the order details
        $order_data = $order->readOne();

        if ($order_data) {
            // Get order items
            $items = $order->getOrderItems($order_id);
            $order_data['items'] = $items;

            // Set response code - 200 OK
            http_response_code(200);

            // Return the order data
            echo json_encode($order_data);
        } else {
            // Set response code - 404 Not found
            http_response_code(404);

            // Tell the user no order found
            echo json_encode(array("message" => "Order not found."));
        }
    } catch (PDOException $e) {
        // Set response code - 500 Internal Server Error
        http_response_code(500);

        // Tell the user
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));

        // Log the error
        error_log("my_orders.php: Database error when fetching single order: " . $e->getMessage());
    }

    // End script execution after handling the single order request
    exit();
}

// Query all orders for the user
try {
    $stmt = $order->readByUser();
    $num = $stmt->rowCount();

    error_log("my_orders.php: Found " . $num . " orders");

    if ($num > 0) {
        // Orders array
        $orders_arr = array();
        $orders_arr["records"] = array();
        $orders_arr["count"] = $num;

        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            $order_item = array(
                "id" => $id,
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
        // Check if we need to create a test order
        if (isset($_GET['create_test']) && $_GET['create_test'] == 'true') {
            error_log("my_orders.php: Creating test order");

            // Create a test order
            $order->user_id = $_SESSION['user_id'];
            $order->total_amount = 99.99;
            $order->status = "pending";
            $order->shipping_address = "123 Test St, Test City, TS 12345";
            $order->payment_method = "credit_card";

            // Add a test item
            $order->items = [
                [
                    "product_id" => 1,
                    "quantity" => 1,
                    "price" => 99.99
                ]
            ];

            if ($order->create()) {
                error_log("my_orders.php: Test order created successfully");

                // Query orders again
                $stmt = $order->readByUser();
                $num = $stmt->rowCount();

                if ($num > 0) {
                    // Orders array
                    $orders_arr = array();
                    $orders_arr["records"] = array();
                    $orders_arr["count"] = $num;

                    // Retrieve table contents
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        extract($row);

                        $order_item = array(
                            "id" => $id,
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
                    echo json_encode(array("message" => "No orders found even after creating test order."));
                }
            } else {
                // Set response code - 500 Internal Server Error
                http_response_code(500);

                // Tell the user
                echo json_encode(array("message" => "Failed to create test order."));
            }
        } else {
            // Set response code - 404 Not found
            http_response_code(404);

            // Tell the user no orders found
            echo json_encode(array("message" => "No orders found."));
        }
    }
} catch (PDOException $e) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);

    // Tell the user
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));

    // Log the error
    error_log("my_orders.php: Database error: " . $e->getMessage());
}
?>
