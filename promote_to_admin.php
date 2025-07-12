<?php
// Include database connection
include_once 'api/config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Email of the user to promote
$email = 'charan881130@gmail.com';

// Check if the user exists
$check_query = "SELECT id, email, role FROM users WHERE email = ?";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(1, $email);
$check_stmt->execute();

if ($check_stmt->rowCount() > 0) {
    $user = $check_stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<h1>User Found</h1>";
    echo "<p>ID: " . $user['id'] . "</p>";
    echo "<p>Email: " . $user['email'] . "</p>";
    echo "<p>Current Role: " . $user['role'] . "</p>";
    
    // Check if user is already an admin
    if ($user['role'] === 'admin') {
        echo "<p style='color: orange;'>This user is already an admin.</p>";
    } else {
        // Update user role to admin
        $update_query = "UPDATE users SET role = 'admin' WHERE id = ?";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(1, $user['id']);
        
        if ($update_stmt->execute()) {
            echo "<p style='color: green;'>User has been successfully promoted to admin!</p>";
            
            // Verify the update
            $verify_query = "SELECT role FROM users WHERE id = ?";
            $verify_stmt = $db->prepare($verify_query);
            $verify_stmt->bindParam(1, $user['id']);
            $verify_stmt->execute();
            $updated_user = $verify_stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "<p>New Role: " . $updated_user['role'] . "</p>";
        } else {
            echo "<p style='color: red;'>Failed to update user role.</p>";
            echo "<p>Error: " . print_r($update_stmt->errorInfo(), true) . "</p>";
        }
    }
} else {
    echo "<h1>User Not Found</h1>";
    echo "<p style='color: red;'>No user found with email: " . $email . "</p>";
    
    // List available users
    $users_query = "SELECT id, email, role FROM users LIMIT 10";
    $users_stmt = $db->prepare($users_query);
    $users_stmt->execute();
    
    if ($users_stmt->rowCount() > 0) {
        echo "<h2>Available Users</h2>";
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>Email</th><th>Role</th></tr>";
        
        while ($row = $users_stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . $row['role'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<p>No users found in the database.</p>";
    }
}

// Add a link to go back to the home page
echo "<p><a href='/Modparts/'>Back to Home</a></p>";
?>
