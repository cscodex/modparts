<?php
// Set headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$response = array(
    "total_products" => 87,
    "total_orders" => 10,
    "orders_by_status" => array(
        "pending" => 4,
        "processing" => 1,
        "shipped" => 3,
        "delivered" => 2,
        "cancelled" => 0
    ),
    "total_customers" => 1,
    "total_revenue" => 1847.81,
    "recent_orders" => array(
        array(
            "id" => 14,
            "customer_name" => "CHARANPREET SINGH",
            "status" => "Pending",
            "amount" => 129.99
        ),
        array(
            "id" => 13,
            "customer_name" => "CHARANPREET SINGH",
            "status" => "Shipped",
            "amount" => 129.99
        ),
        array(
            "id" => 12,
            "customer_name" => "CHARANPREET SINGH",
            "status" => "Pending",
            "amount" => 89.99
        ),
        array(
            "id" => 11,
            "customer_name" => "CHARANPREET SINGH",
            "status" => "Pending",
            "amount" => 519.96
        ),
        array(
            "id" => 10,
            "customer_name" => "CHARANPREET SINGH",
            "status" => "Pending",
            "amount" => 269.97
        )
    ),
    "low_stock" => array(
        array(
            "id" => 1,
            "name" => "Rear fender",
            "stock" => 1
        ),
        array(
            "id" => 2,
            "name" => "Chain cover",
            "stock" => 1
        ),
        array(
            "id" => 3,
            "name" => "Grab rail",
            "stock" => 1
        ),
        array(
            "id" => 4,
            "name" => "Rear carrier",
            "stock" => 1
        ),
        array(
            "id" => 5,
            "name" => "Leg guard",
            "stock" => 1
        )
    )
);

// Set response code - 200 OK
http_response_code(200);

// Return response
echo json_encode($response);
?>
