<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Headers

// Include database and product model
include_once '../../config/database.php';
include_once '../../models/Product.php';

if (!class_exists('Product')) {
    http_response_code(500);
    echo json_encode(["message" => "Product model not found or failed to load."]);
    exit;
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate product object
$product = new Product($db);

// Set ID property of record to read
$product->id = isset($_GET['id']) ? $_GET['id'] : die();

if (!is_numeric($product->id)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid product ID."]);
    exit;
}

// Read the details of product
$product->readOne();

if ($product->name != null) {
    // Create array
    $product_arr = array(
        "id" => $product->id,
        "name" => $product->name,
        "description" => html_entity_decode($product->description),
        "price" => $product->price,
        "category_id" => $product->category_id,
        "category_name" => $product->category_name,
        "condition_status" => $product->condition_status,
        "quantity" => $product->quantity,
        "image_url" => $product->image_url
    );

    // Set response code - 200 OK
    http_response_code(200);

    // Make it json format
    echo json_encode($product_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);

    // Tell the user product does not exist
    echo json_encode(array("message" => "Product does not exist."));
}
?>
