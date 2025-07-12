<?php
// Include CORS headers
include_once '../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");

// Include database and category model
include_once '../../config/database.php';
include_once '../../models/Category.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate category object
$category = new Category($db);

// Query categories
$stmt = $category->read();
$num = $stmt->rowCount();

// Check if more than 0 record found
if ($num > 0) {
    // Categories array
    $categories_arr = array();
    $categories_arr["records"] = array();

    // Retrieve table contents
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $category_item = array(
            "id" => $id,
            "name" => $name,
            "description" => html_entity_decode($description)
        );

        array_push($categories_arr["records"], $category_item);
    }

    // Set response code - 200 OK
    http_response_code(200);

    // Show categories data
    echo json_encode($categories_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);

    // Tell the user no categories found
    echo json_encode(array("message" => "No categories found."));
}
?>
