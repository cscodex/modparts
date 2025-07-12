<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
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

// Make sure data is not empty
if (
    !empty($data->name) &&
    !empty($data->price) &&
    !empty($data->category_id) &&
    !empty($data->condition_status) &&
    !empty($data->quantity)
) {
    // Set product property values
    $product->name = $data->name;
    $product->price = $data->price;
    $product->description = $data->description ?? "";
    $product->category_id = $data->category_id;
    $product->condition_status = $data->condition_status;
    $product->quantity = $data->quantity;
    $product->image_url = $data->image_url ?? "";

    // Create the product
    if ($product->create()) {
        // Set response code - 201 Created
        http_response_code(201);

        // Tell the user
        echo json_encode(array("message" => "Product was created."));
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to create product."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to create product. Data is incomplete."));
}
?>
