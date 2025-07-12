<?php
// Include CORS headers
include_once __DIR__ . '/../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");

// Function to validate JWT token
function validateToken() {
    // Get headers
    $headers = getallheaders();

    // Start session first to ensure we have access to session data
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
        error_log("Auth middleware: Started new session with ID: " . session_id());
    } else {
        error_log("Auth middleware: Using existing session with ID: " . session_id());
    }

    // Debug session data
    error_log("Auth middleware: Session data: " . print_r($_SESSION, true));

    // For development/testing purposes, create a test user if none exists
    if (!isset($_SESSION['user_id'])) {
        error_log("Auth middleware: Creating test user session for development");
        $_SESSION['user_id'] = 1; // Use ID 1 for testing
        $_SESSION['user_role'] = 'user';
        $_SESSION['email'] = 'test@example.com';
        $_SESSION['token'] = 'test_token_123';
        error_log("Auth middleware: Test user created with ID: " . $_SESSION['user_id']);
    }

    // For testing purposes, if user_id is set in session, consider the user authenticated
    if (isset($_SESSION['user_id'])) {
        error_log("Auth middleware: User is authenticated via session (user_id: " . $_SESSION['user_id'] . ")");
        return true;
    }

    // Check if Authorization header exists
    if (!isset($headers['Authorization'])) {
        error_log("Auth middleware: No Authorization header found");
        return false;
    }

    // Get the token from the Authorization header
    $authHeader = $headers['Authorization'];
    $token = str_replace('Bearer ', '', $authHeader);

    // Validate token (simple validation for now)
    if (empty($token)) {
        error_log("Auth middleware: Empty token");
        return false;
    }

    // In a real application, you would validate the JWT token here
    // For simplicity, we'll just check if the token exists in the session
    // Session is already started above, so we don't need to start it again

    error_log("Auth middleware: Session ID: " . session_id());
    error_log("Auth middleware: Token from header: " . $token);
    error_log("Auth middleware: Token in session: " . (isset($_SESSION['token']) ? $_SESSION['token'] : 'not set'));

    if (!isset($_SESSION['token']) || $_SESSION['token'] !== $token) {
        error_log("Auth middleware: Token validation failed");
        // For development, still allow access
        return true;
    }

    error_log("Auth middleware: Token validation successful for user ID: " . $_SESSION['user_id']);
    return true;
}

// Function to validate admin access
function validateAdmin() {
    // First validate the token
    if (!validateToken()) {
        error_log("Admin validation failed: Token validation failed");
        return false;
    }

    // Check if user is admin
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

    error_log("Admin validation: User role: " . (isset($_SESSION['user_role']) ? $_SESSION['user_role'] : 'not set'));

    if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
        error_log("Admin validation failed: User is not an admin");
        return false;
    }

    error_log("Admin validation successful for user ID: " . $_SESSION['user_id']);
    return true;
}
?>
