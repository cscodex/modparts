<?php
// Database connection parameters
$host = "localhost";
$db_name = "yamaha_rd_parts";
$username = "root";
$password = "";

try {
    // Connect to database
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully.\n";
    
    // Check if admin user already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = 'admin@yamahaparts.com'");
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        // Update existing admin user
        $password_hash = password_hash('admin123', PASSWORD_BCRYPT);
        
        $update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = 'admin@yamahaparts.com'");
        $update_stmt->bindParam(1, $password_hash);
        $update_stmt->execute();
        
        echo "Admin user password updated successfully.\n";
    } else {
        // Create new admin user
        $password_hash = password_hash('admin123', PASSWORD_BCRYPT);
        
        $insert_stmt = $conn->prepare("INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, 'Admin', 'User', 'admin')");
        $insert_stmt->bindParam(1, $email);
        $insert_stmt->bindParam(2, $password_hash);
        
        $email = 'admin@yamahaparts.com';
        $insert_stmt->execute();
        
        echo "Admin user created successfully.\n";
    }
    
    // Show the admin user details
    $stmt = $conn->prepare("SELECT id, email, role FROM users WHERE email = 'admin@yamahaparts.com'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Admin user details:\n";
    echo "ID: " . $user['id'] . "\n";
    echo "Email: " . $user['email'] . "\n";
    echo "Role: " . $user['role'] . "\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
