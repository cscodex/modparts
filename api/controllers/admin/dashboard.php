<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and auth middleware
include_once '../../config/database.php';
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

// Get dashboard data
try {
    // Get total products
    $query = "SELECT COUNT(*) as total_products FROM products";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $total_products = $stmt->fetch(PDO::FETCH_ASSOC)['total_products'];

    // Get total orders
    $query = "SELECT COUNT(*) as total_orders FROM orders";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $total_orders = $stmt->fetch(PDO::FETCH_ASSOC)['total_orders'];

    // Get orders by status
    $query = "SELECT status, COUNT(*) as count FROM orders GROUP BY status";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $orders_by_status = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $status = $row['status'] ?: 'pending'; // Default to pending if null
        $orders_by_status[$status] = $row['count'];
    }

    // Ensure all statuses have a value
    $all_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    foreach ($all_statuses as $status) {
        if (!isset($orders_by_status[$status])) {
            $orders_by_status[$status] = 0;
        }
    }

    // Get total customers
    $query = "SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $total_customers = $stmt->fetch(PDO::FETCH_ASSOC)['total_customers'];

    // Get total revenue
    $query = "SELECT SUM(total_amount) as total_revenue FROM orders";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $total_revenue = $stmt->fetch(PDO::FETCH_ASSOC)['total_revenue'] ?? 0;

    // Get recent orders
    $query = "SELECT o.id, o.total_amount, o.status, o.created_at, u.email, u.first_name, u.last_name
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              ORDER BY o.created_at DESC
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $recent_orders = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $recent_orders[] = $row;
    }

    // Get low stock products
    $query = "SELECT id, name, quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $low_stock = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $low_stock[] = $row;
    }

    // Create response
    $response = array(
        "total_products" => $total_products,
        "total_orders" => $total_orders,
        "orders_by_status" => $orders_by_status,
        "total_customers" => $total_customers,
        "total_revenue" => $total_revenue,
        "recent_orders" => $recent_orders,
        "low_stock" => $low_stock
    );

    // Set response code - 200 OK
    http_response_code(200);

    // Return data
    echo json_encode($response);
} catch (Exception $e) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);

    // Tell the user
    echo json_encode(array("message" => "Unable to get dashboard data: " . $e->getMessage()));
}
?>
