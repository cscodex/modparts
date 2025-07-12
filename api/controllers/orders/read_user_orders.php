<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Log that this endpoint was accessed
error_log("read_user_orders.php in controllers/orders was accessed - redirecting to my_orders.php");

// Include the new endpoint directly
// Use absolute path to include my_orders.php
$base_path = $_SERVER['DOCUMENT_ROOT'] . '/Modparts/api/my_orders.php';
error_log("Including file from path: " . $base_path);
include_once $base_path;
?>
