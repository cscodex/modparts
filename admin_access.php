<?php
// This file provides direct access to the admin account
// WARNING: This is for development purposes only and should be removed in production

// Include database connection
include_once 'api/config/database.php';
include_once 'api/models/User.php';

// Start session
session_start();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Generate a token
$token = bin2hex(random_bytes(32));

// Get admin user details
$query = "SELECT * FROM users WHERE email = 'admin@yamahaparts.com' AND role = 'admin' LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Store admin info in session
    $_SESSION['token'] = $token;
    $_SESSION['user_id'] = $admin['id'];
    $_SESSION['user_email'] = $admin['email'];
    $_SESSION['user_role'] = $admin['role'];
    
    // Create user object for frontend
    $user = [
        'id' => $admin['id'],
        'email' => $admin['email'],
        'first_name' => $admin['first_name'],
        'last_name' => $admin['last_name'],
        'role' => $admin['role']
    ];
    
    // Set JavaScript to store token and user in localStorage
    echo "
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Access</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .success { color: green; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 5px; }
            button { background: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>Admin Access</h1>
            <p class='success'>Successfully logged in as admin!</p>
            <p>User: {$admin['first_name']} {$admin['last_name']} ({$admin['email']})</p>
            <p>Role: {$admin['role']}</p>
            <p>Token has been generated and session has been created.</p>
            
            <div>
                <button id='adminBtn'>Go to Admin Dashboard</button>
                <button id='homeBtn'>Go to Home Page</button>
            </div>
        </div>
        
        <script>
            // Store token and user in localStorage
            localStorage.setItem('token', '$token');
            localStorage.setItem('user', '" . json_encode($user) . "');
            
            // Add button event listeners
            document.getElementById('adminBtn').addEventListener('click', function() {
                window.location.href = '/Modparts/admin';
            });
            
            document.getElementById('homeBtn').addEventListener('click', function() {
                window.location.href = '/Modparts/';
            });
        </script>
    </body>
    </html>
    ";
} else {
    echo "
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Access Failed</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: red; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>Admin Access Failed</h1>
            <p class='error'>Could not find admin user in the database.</p>
            <p>Please make sure the admin user exists with email 'admin@yamahaparts.com'.</p>
            <p>You can create the admin user by running the create_admin.php script.</p>
            
            <a href='/Modparts/create_admin.php'>Run Create Admin Script</a>
        </div>
    </body>
    </html>
    ";
}
?>
