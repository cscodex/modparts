<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and user model
include_once '../config/database.php';
include_once '../models/User.php';
include_once '../middleware/auth.php';

// Define validateAuth function if it doesn't exist
if (!function_exists('validateAuth')) {
    function validateAuth() {
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

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
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get user ID from session
$user_id = $_SESSION['user_id'] ?? null;

// If no user ID in session, try to get from token
if (!$user_id) {
    $headers = getallheaders();
    $token = null;

    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        $token = str_replace('Bearer ', '', $authHeader);

        // In a real app, you would decode the JWT to get the user ID
        // For now, we'll use a default user ID for development
        $user_id = 1; // Default user ID
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email)
) {
    // Set user property values
    $user->id = $user_id;
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->email = $data->email;
    $user->phone = $data->phone ?? '';
    $user->address = $data->address ?? '';
    $user->city = $data->city ?? '';
    $user->state = $data->state ?? '';
    $user->zip_code = $data->zip_code ?? '';
    $user->preferred_payment_method = $data->preferred_payment_method ?? 'credit_card';

    // Update the user
    if ($user->updateProfile()) {
        // Get updated user data
        $user_data = $user->readOne();

        // Set response code - 200 OK
        http_response_code(200);

        // Tell the user
        echo json_encode(array(
            "message" => "Profile was updated.",
            "user" => $user_data
        ));
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to update profile."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to update profile. Data is incomplete."));
}
?>
