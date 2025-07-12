<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database and object files
include_once '../../config/database.php';
include_once '../../models/user.php';
include_once '../../includes/response.php';

// Instantiate database and user object
$database = new Database();
$db = $database->getConnection();

// Check if users table exists
try {
    $stmt = $db->prepare("SHOW TABLES LIKE 'users'");
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        // Table doesn't exist, create it
        include_once 'create_table.php';
        exit; // Exit after creating the table
    }
} catch(PDOException $e) {
    send_json_response(503, ["message" => "Database error: " . $e->getMessage()]);
}

// Initialize user object
$user = new User($db);

// Query users
$stmt = $user->read();
$num = $stmt->rowCount();

// Check if more than 0 record found
if ($num > 0) {
    // Users array
    $users_arr = array();

    // Retrieve table contents
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $user_item = array(
            "id" => $id,
            "first_name" => $first_name,
            "last_name" => $last_name,
            "email" => $email,
            "phone" => $phone,
            "address" => $address,
            "role" => $role,
            "created_at" => $created_at,
            "updated_at" => $updated_at
        );

        array_push($users_arr, $user_item);
    }

    send_json_response(200, $users_arr);
} else {
    send_json_response(404, ["message" => "No users found."]);
}
?>
