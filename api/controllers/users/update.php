<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once '../../config/database.php';
include_once '../../models/user.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Prepare user object
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure id is not empty
if (!empty($data->id)) {
    // Set ID property of user to be updated
    $user->id = $data->id;

    // Set user property values
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->email = $data->email;
    if (!empty($data->password)) {
        $user->password = $data->password;
    }
    $user->phone = $data->phone ?? '';
    $user->address = $data->address ?? '';
    $user->role = $data->role ?? 'customer';

    // Update the user
    if ($user->update()) {
        // Set response code - 200 ok
        http_response_code(200);

        // Tell the user
        echo json_encode(array("message" => "User was updated."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array("message" => "Unable to update user."));
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);

    // Tell the user
    echo json_encode(array("message" => "Unable to update user. User ID is required."));
}
?>
