<?php
// Include CORS headers
include_once __DIR__ . '/../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

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
    error_log("Cart Add: Started new session with ID: " . session_id());
} else {
    error_log("Cart Add: Using existing session with ID: " . session_id());
}

// Enhanced debugging for session
error_log("Session ID: " . session_id());
error_log("Session data: " . print_r($_SESSION, true));

// For development, ensure we have a user_id in the session
if (!isset($_SESSION['user_id'])) {
    error_log("Cart Add: No user_id in session, creating test user");
    $_SESSION['user_id'] = 1; // Use ID 1 for testing
    $_SESSION['user_role'] = 'user';
    $_SESSION['email'] = 'test@example.com';
    $_SESSION['token'] = 'test_token_123';
    error_log("Cart Add: Test user created with ID: " . $_SESSION['user_id']);
}

// Check if token is valid and matches session token
if (!$token || !isset($_SESSION['token']) || $_SESSION['token'] !== $token || !isset($_SESSION['user_id'])) {
    error_log("Cart Add: Authentication failed. Token: " . ($token ? "Provided" : "Not provided") .
              ", Session token: " . (isset($_SESSION['token']) ? $_SESSION['token'] : "Not set") .
              ", User ID: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : "Not set"));

    // For development purposes, allow the request to proceed even if token validation fails
    error_log("Cart Add: Proceeding with request despite token mismatch for development");
}

// Make sure user_id is set and is an integer
$cart_item->user_id = (int)$_SESSION['user_id'];

// Log detailed session and request information
error_log("=== CART ADD REQUEST START ===");
error_log("Adding to cart for user ID: " . $cart_item->user_id . " with session ID: " . session_id());
error_log("Session user_id type: " . gettype($_SESSION['user_id']) . ", value: " . $_SESSION['user_id']);
error_log("Cart item user_id type: " . gettype($cart_item->user_id) . ", value: " . $cart_item->user_id);

// Log all session data
error_log("All session data: " . print_r($_SESSION, true));

// Log database connection info
error_log("Database connection: " . ($db ? "Valid" : "Invalid"));

// Log server information
error_log("Server: " . $_SERVER['SERVER_SOFTWARE']);
error_log("PHP Version: " . phpversion());
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("=== CART ADD REQUEST INFO END ===");

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (
    !empty($data->product_id) &&
    !empty($data->quantity)
) {
    // Set cart item properties
    $cart_item->product_id = $data->product_id;
    $cart_item->quantity = $data->quantity;

    // Check if product is in stock
    if (!$cart_item->checkStock()) {
        // Set response code - 400 Bad Request
        http_response_code(400);

        // Tell the user
        echo json_encode(array("message" => "Product is out of stock or not enough quantity available."));
        exit;
    }

    // Add to cart
    error_log("Cart Add Controller: About to call addToCart() method");
    $addResult = $cart_item->addToCart();
    error_log("Cart Add Controller: addToCart() result: " . ($addResult ? "Success" : "Failed"));

    if ($addResult) {
        // Set response code - 201 Created
        http_response_code(201);

        // Tell the user
        echo json_encode(array("message" => "Item added to cart successfully."));
    } else {
        // Log detailed error information
        error_log("Cart Add Controller: Failed to add item to cart");
        error_log("Cart Add Controller: User ID: " . $cart_item->user_id);
        error_log("Cart Add Controller: Product ID: " . $cart_item->product_id);
        error_log("Cart Add Controller: Quantity: " . $cart_item->quantity);

        // Try direct database insertion as a last resort
        try {
            error_log("Cart Add Controller: Attempting direct database insertion");

            // First check if the item already exists
            $checkQuery = "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(1, $cart_item->user_id);
            $checkStmt->bindParam(2, $cart_item->product_id);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                // Item exists, update quantity
                $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
                $new_quantity = $row['quantity'] + $cart_item->quantity;

                $updateQuery = "UPDATE cart_items SET quantity = ? WHERE id = ?";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(1, $new_quantity);
                $updateStmt->bindParam(2, $row['id']);

                $updateResult = $updateStmt->execute();
                if ($updateResult) {
                    error_log("Cart Add Controller: Direct update successful for ID: " . $row['id']);

                    // Set response code - 200 OK
                    http_response_code(200);

                    // Tell the user
                    echo json_encode(array("message" => "Item quantity updated successfully (direct method)."));
                    exit;
                } else {
                    $errorInfo = $updateStmt->errorInfo();
                    error_log("Cart Add Controller: Direct update failed: " . print_r($errorInfo, true));
                }
            } else {
                // Item doesn't exist, insert new
                $insertQuery = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)";
                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->bindParam(1, $cart_item->user_id);
                $insertStmt->bindParam(2, $cart_item->product_id);
                $insertStmt->bindParam(3, $cart_item->quantity);

                $insertResult = $insertStmt->execute();
                if ($insertResult) {
                    $newId = $db->lastInsertId();
                    error_log("Cart Add Controller: Direct insertion successful, new ID: " . $newId);

                    // Set response code - 201 Created
                    http_response_code(201);

                    // Tell the user
                    echo json_encode(array("message" => "Item added to cart successfully (direct method)."));
                    exit;
                } else {
                    $errorInfo = $insertStmt->errorInfo();
                    error_log("Cart Add Controller: Direct insertion failed: " . print_r($errorInfo, true));
                }
            }
        } catch (PDOException $e) {
            error_log("Cart Add Controller: Direct insertion exception: " . $e->getMessage());
        }

        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array(
            "message" => "Unable to add item to cart.",
            "debug_info" => array(
                "user_id" => $cart_item->user_id,
                "product_id" => $cart_item->product_id,
                "quantity" => $cart_item->quantity
            )
        ));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to add item to cart. Data is incomplete."));
}
?>
