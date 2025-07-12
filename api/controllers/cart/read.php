<?php
// Include CORS headers
include_once __DIR__ . '/../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Include database and models
include_once '../../config/database.php';
include_once '../../models/CartItem.php';
include_once '../../middleware/auth.php';

// Check if user is authenticated
if (!validateToken()) {
    // Set response code - 401 Unauthorized
    http_response_code(401);

    // Tell the user access denied
    echo json_encode(array("message" => "Access denied. User not authenticated."));
    exit;
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize cart item object
$cart_item = new CartItem($db);

// Get user ID from token validation
$headers = getallheaders();
$token = null;

// Check if Authorization header exists
if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
    $token = str_replace('Bearer ', '', $authHeader);
}

// Start session to get user ID
if (session_status() === PHP_SESSION_NONE) {
    // Set session cookie parameters for better compatibility
    session_set_cookie_params([
        'lifetime' => 86400, // 1 day
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// Enhanced debugging for session
error_log("Session ID in read.php: " . session_id());
error_log("Session data in read.php: " . print_r($_SESSION, true));

// Check if token is valid and matches session token
if (!$token || !isset($_SESSION['token']) || $_SESSION['token'] !== $token || !isset($_SESSION['user_id'])) {
    // Set response code - 401 Unauthorized
    http_response_code(401);

    // Tell the user access denied
    echo json_encode(array(
        "message" => "Access denied. Invalid or missing token.",
        "token_provided" => $token ? "Yes" : "No",
        "session_token_exists" => isset($_SESSION['token']) ? "Yes" : "No",
        "user_id_exists" => isset($_SESSION['user_id']) ? "Yes" : "No",
        "session_id" => session_id()
    ));
    exit;
}

$cart_item->user_id = $_SESSION['user_id'];

// Log the user ID for debugging
error_log("Reading cart for user ID: " . $cart_item->user_id . " with session ID: " . session_id());

// Read cart items
$stmt = $cart_item->getUserCart();
$num = $stmt->rowCount();

if ($num > 0) {
    // Cart items array
    $cart_items_arr = array();
    $cart_items_arr["items"] = array();
    $total = 0;

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $item = array(
            "id" => $id,
            "product_id" => $product_id,
            "name" => $name,
            "price" => $price,
            "quantity" => $quantity,
            "image_url" => $image_url,
            "stock_quantity" => $stock_quantity,
            "subtotal" => $price * $quantity
        );

        $total += $price * $quantity;

        array_push($cart_items_arr["items"], $item);
    }

    $cart_items_arr["total"] = $total;
    $cart_items_arr["count"] = $num;

    // Set response code - 200 OK
    http_response_code(200);

    // Return cart items
    echo json_encode($cart_items_arr);
} else {
    // Set response code - 200 OK
    http_response_code(200);

    // No cart items found
    echo json_encode(
        array(
            "items" => array(),
            "total" => 0,
            "count" => 0
        )
    );
}
?>
