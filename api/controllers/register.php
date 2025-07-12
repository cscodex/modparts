<?php
// Include CORS headers
include_once '../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");

// Include database and user model
include_once '../config/database.php';
include_once '../models/User.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate user object
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->first_name) &&
    !empty($data->last_name)
) {
    // Check if email already exists
    $user->email = $data->email;
    if ($user->emailExists()) {
        // Set response code - 400 Bad Request
        http_response_code(400);

        // Tell the user email already exists
        echo json_encode(array("message" => "Email already exists."));
        exit;
    }

    // Set user property values
    $user->email = $data->email;
    $user->password = $data->password;
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->address = $data->address ?? "";
    $user->phone = $data->phone ?? "";
    $user->role = "customer"; // Default role is customer

    // Create the user
    if ($user->create()) {
        // Set response code - 201 Created
        http_response_code(201);

        // Tell the user
        echo json_encode(array("message" => "User was created."));
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to create user."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user data is incomplete
    echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
}
?>
