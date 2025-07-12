<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and user model
include_once '../config/database.php';
include_once '../models/User.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define validateAuth function if it doesn't exist
if (!function_exists('validateAuth')) {
    function validateAuth() {
        // Check if user is logged in
        if (isset($_SESSION['user_id'])) {
            return true;
        }
        
        // Check for token in Authorization header
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            $token = str_replace('Bearer ', '', $authHeader);
            
            // In a real app, you would validate the token
            // For now, just check if it exists
            if (!empty($token)) {
                return true;
            }
        }
        
        return false;
    }
}

// Check if user is authenticated
if (!validateAuth()) {
    // Set response code - 401 Unauthorized
    http_response_code(401);
    
    // Tell the user access denied
    echo json_encode(array("message" => "Unauthorized. Please log in."));
    exit;
}

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate user object
$user = new User($db);

// Get user ID from session
$user_id = $_SESSION['user_id'] ?? null;

// If no user ID in session, try to get from token
if (!$user_id) {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        $token = str_replace('Bearer ', '', $authHeader);
        
        // Log the token for debugging
        error_log("get_profile.php: Token from Authorization header: " . $token);
        
        // In a real app, you would decode the JWT to get the user ID
        // For now, we'll try to find the user ID from the token
        $stmt = $db->prepare("SELECT user_id FROM users WHERE token = ?");
        $stmt->bindParam(1, $token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $user_id = $row['user_id'];
            error_log("get_profile.php: Found user ID from token: " . $user_id);
        } else {
            // Try to get user ID from session data
            error_log("get_profile.php: Session ID: " . session_id());
            error_log("get_profile.php: Session data: " . print_r($_SESSION, true));
            
            if (isset($_SESSION['user_id'])) {
                $user_id = $_SESSION['user_id'];
                error_log("get_profile.php: Using user ID from session: " . $user_id);
            }
        }
    }
}

// If still no user ID, return error
if (!$user_id) {
    // Set response code - 401 Unauthorized
    http_response_code(401);
    
    // Tell the user access denied
    echo json_encode(array("message" => "Unauthorized. User ID not found."));
    exit;
}

// Set user ID
$user->id = $user_id;

// Get user data
$user_data = $user->readOne();

if ($user_data) {
    // Remove sensitive data
    unset($user_data['password']);
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Return user data
    echo json_encode($user_data);
} else {
    // Set response code - 404 Not Found
    http_response_code(404);
    
    // Tell the user
    echo json_encode(array("message" => "User not found."));
}
?>
