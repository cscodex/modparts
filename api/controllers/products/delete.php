<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database, product model, and auth middleware
include_once '../../config/database.php';
include_once '../../models/Product.php';
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

// Instantiate product object
$product = new Product($db);

// Get product id
$data = json_decode(file_get_contents("php://input"));

// Set product id to be deleted
$product->id = $data->id;

// Delete the product
if ($product->delete()) {
    // Set response code - 200 OK
    http_response_code(200);

    // Tell the user
    echo json_encode(array("message" => "Product was deleted."));
} else {
    // Set response code - 503 Service Unavailable
    http_response_code(503);

    // Tell the user
    echo json_encode(array("message" => "Unable to delete product."));
}
?>
