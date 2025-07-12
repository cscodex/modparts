<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/csv; charset=UTF-8");
header("Content-Disposition: attachment; filename=orders.csv");
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

// Get orders data
$orders = $order->exportToCSV();

// Create CSV file
$output = fopen("php://output", "w");

// CSV header
fputcsv($output, array('Order ID', 'Total Amount', 'Status', 'Shipping Address', 'Payment Method', 'Created At', 'Customer Email', 'Customer Name'));

// Write data rows
foreach ($orders as $row) {
    $customer_name = $row['first_name'] . ' ' . $row['last_name'];
    fputcsv($output, array(
        $row['id'],
        $row['total_amount'],
        $row['status'],
        $row['shipping_address'],
        $row['payment_method'],
        $row['created_at'],
        $row['email'],
        $customer_name
    ));
}

fclose($output);
?>
