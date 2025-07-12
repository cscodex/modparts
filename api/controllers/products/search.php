<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database and product model
include_once '../../config/database.php';
include_once '../../models/Product.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate product object
$product = new Product($db);

// Get keywords
$keywords = isset($_GET["s"]) ? $_GET["s"] : "";

// Query products
$stmt = $product->search($keywords);
$num = $stmt->rowCount();

// Check if more than 0 record found
if ($num > 0) {
    // Products array
    $products_arr = array();
    $products_arr["records"] = array();

    // Retrieve table contents
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $product_item = array(
            "id" => $id,
            "name" => $name,
            "description" => html_entity_decode($description),
            "price" => $price,
            "category_id" => $category_id,
            "category_name" => $category_name,
            "condition_status" => $condition_status,
            "quantity" => $quantity,
            "image_url" => $image_url
        );

        array_push($products_arr["records"], $product_item);
    }

    // Set response code - 200 OK
    http_response_code(200);

    // Show products data
    echo json_encode($products_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);

    // Tell the user no products found
    echo json_encode(array("message" => "No products found."));
}
?>
