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
    !empty($data->password)
) {
    // Set user property values
    $user->email = $data->email;
    $user->password = $data->password;

    // Check if user exists and password is correct
    if ($user->login()) {
        // Start session if not already started
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

        // Generate a simple token (in a real app, use JWT)
        $token = bin2hex(random_bytes(32));

        // Store token and user info in session
        $_SESSION['token'] = $token;
        $_SESSION['user_id'] = (int)$user->id; // Ensure user_id is stored as an integer
        $_SESSION['user_email'] = $user->email;
        $_SESSION['user_role'] = $user->role;

        // Log session information for debugging
        error_log("Login: Session ID: " . session_id());
        error_log("Login: User ID: " . $user->id);
        error_log("Login: Token: " . $token);

        // Make sure session is written
        session_write_close();

        // Log session ID after write close
        error_log("Login: Session ID after write close: " . session_id());

        // Set response code - 200 OK
        http_response_code(200);

        // Get complete user data
        $user_data = $user->readOne();

        // Remove sensitive data
        if ($user_data) {
            unset($user_data['password']);
        } else {
            // Fallback to basic user data if readOne fails
            $user_data = array(
                "id" => $user->id,
                "email" => $user->email,
                "first_name" => $user->first_name,
                "last_name" => $user->last_name,
                "role" => $user->role,
                "address" => $user->address ?? '',
                "phone" => $user->phone ?? '',
                "city" => $user->city ?? '',
                "state" => $user->state ?? '',
                "zip_code" => $user->zip_code ?? '',
                "preferred_payment_method" => $user->preferred_payment_method ?? 'credit_card'
            );
        }

        // Create response array
        echo json_encode(array(
            "message" => "Login successful.",
            "token" => $token,
            "user" => $user_data
        ));
    } else {
        // Set response code - 401 Unauthorized
        http_response_code(401);

        // Tell the user login failed
        echo json_encode(array("message" => "Invalid email or password."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);

    // Tell the user data is incomplete
    echo json_encode(array("message" => "Unable to login. Data is incomplete."));
}
?>
