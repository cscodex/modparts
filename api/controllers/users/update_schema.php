<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database connection
include_once '../../config/database.php';

// Instantiate database object
$database = new Database();
$db = $database->getConnection();

// SQL to add new columns to users table if they don't exist
$queries = [
    // Add shipping address fields
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_address TEXT AFTER address",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100) AFTER shipping_address",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100) AFTER shipping_city",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS shipping_zip_code VARCHAR(20) AFTER shipping_state",
    
    // Add billing address fields
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_address TEXT AFTER shipping_zip_code",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100) AFTER billing_address",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_state VARCHAR(100) AFTER billing_city",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_zip_code VARCHAR(20) AFTER billing_state",
    
    // Add preferred address field
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_address ENUM('shipping', 'billing') DEFAULT 'shipping' AFTER billing_zip_code"
];

$success = true;
$errors = [];

try {
    // Execute each query
    foreach ($queries as $query) {
        try {
            $db->exec($query);
        } catch(PDOException $e) {
            $success = false;
            $errors[] = $e->getMessage();
        }
    }
    
    // Set response code
    http_response_code($success ? 200 : 503);
    
    // Return response
    echo json_encode([
        "message" => $success ? "Schema updated successfully." : "Error updating schema.",
        "errors" => $errors
    ]);
} catch(PDOException $e) {
    // Set response code - 503 service unavailable
    http_response_code(503);
    
    // Tell the user
    echo json_encode(["message" => "Unable to update schema: " . $e->getMessage()]);
}
?>
