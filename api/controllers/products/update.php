<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure id is not empty
if (!empty($data->id)) {
    // Set ID property of product to be updated
    $product->id = $data->id;
    
    // Set product property values
    $product->name = $data->name;
    $product->price = $data->price;
    $product->description = $data->description;
    $product->category_id = $data->category_id;
    $product->condition_status = $data->condition_status;
    $product->quantity = $data->quantity;
    $product->image_url = $data->image_url;

    // Update the product
    if ($product->update()) {
        // Set response code - 200 OK
        http_response_code(200);

        // Tell the user
        echo json_encode(array("message" => "Product was updated."));
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to update product."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to update product. No ID provided."));
}
?>
