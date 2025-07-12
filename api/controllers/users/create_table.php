<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database connection
include_once '../../config/database.php';

// Instantiate database object
$database = new Database();
$db = $database->getConnection();

// SQL to create users table if it doesn't exist
$query = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    role ENUM('admin', 'customer') DEFAULT 'customer',
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    preferred_payment_method VARCHAR(50) DEFAULT 'credit_card',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

try {
    // Execute query
    $db->exec($query);
    
    // Check if admin user exists
    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $stmt->execute();
    $adminCount = $stmt->fetchColumn();
    
    // If no admin exists, create a default one
    if ($adminCount == 0) {
        $defaultAdmin = [
            'email' => 'admin@example.com',
            'password' => password_hash('admin123', PASSWORD_BCRYPT),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin'
        ];
        
        $insertQuery = "INSERT INTO users (email, password, first_name, last_name, role) 
                        VALUES (:email, :password, :first_name, :last_name, :role)";
        
        $stmt = $db->prepare($insertQuery);
        $stmt->bindParam(':email', $defaultAdmin['email']);
        $stmt->bindParam(':password', $defaultAdmin['password']);
        $stmt->bindParam(':first_name', $defaultAdmin['first_name']);
        $stmt->bindParam(':last_name', $defaultAdmin['last_name']);
        $stmt->bindParam(':role', $defaultAdmin['role']);
        
        $stmt->execute();
    }
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Tell the user
    echo json_encode(array("message" => "Users table created successfully."));
} catch(PDOException $e) {
    // Set response code - 503 service unavailable
    http_response_code(503);
    
    // Tell the user
    echo json_encode(array("message" => "Unable to create users table: " . $e->getMessage()));
}
?>
