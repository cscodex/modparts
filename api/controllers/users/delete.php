<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
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

// Get user id
$data = json_decode(file_get_contents("php://input"));

// Set user id to be deleted
$user->id = isset($_GET['id']) ? $_GET['id'] : (isset($data->id) ? $data->id : 0);

// Delete the user
if ($user->delete()) {
    // Set response code - 200 ok
    http_response_code(200);

    // Tell the user
    echo json_encode(array("message" => "User was deleted."));
} else {
    // Set response code - 503 service unavailable
    http_response_code(503);

    // Tell the user
    echo json_encode(array("message" => "Unable to delete user."));
}
?>
