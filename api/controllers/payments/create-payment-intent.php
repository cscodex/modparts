<?php
// Include CORS headers
include_once __DIR__ . '/../../includes/cors_headers.php';

// Headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Include auth middleware
include_once '../../middleware/auth.php';

// Check if user is authenticated
if (!validateToken()) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized"));
    exit;
}

// Include Stripe PHP library (install via Composer)
require_once '../../vendor/autoload.php';

// Set your secret key
\Stripe\Stripe::setApiKey('sk_test_your_stripe_secret_key_here');

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->amount) || empty($data->currency)) {
    http_response_code(400);
    echo json_encode(array("message" => "Amount and currency are required"));
    exit;
}

try {
    // Create a PaymentIntent with the order amount and currency
    $paymentIntent = \Stripe\PaymentIntent::create([
        'amount' => $data->amount, // Amount in cents
        'currency' => $data->currency,
        'metadata' => [
            'user_id' => $_SESSION['user_id'] ?? 1,
            'customer_name' => $data->customer_info->firstName . ' ' . $data->customer_info->lastName,
            'customer_email' => $data->customer_info->email ?? '',
        ],
        'automatic_payment_methods' => [
            'enabled' => true,
        ],
    ]);

    // Log payment intent creation
    error_log("Payment Intent created: " . $paymentIntent->id);

    // Return client secret
    echo json_encode([
        'client_secret' => $paymentIntent->client_secret,
        'payment_intent_id' => $paymentIntent->id
    ]);

} catch (\Stripe\Exception\CardException $e) {
    // Since it's a decline, \Stripe\Exception\CardException will be caught
    http_response_code(400);
    echo json_encode(['error' => $e->getError()->message]);
} catch (\Stripe\Exception\RateLimitException $e) {
    // Too many requests made to the API too quickly
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded']);
} catch (\Stripe\Exception\InvalidRequestException $e) {
    // Invalid parameters were supplied to Stripe's API
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
} catch (\Stripe\Exception\AuthenticationException $e) {
    // Authentication with Stripe's API failed
    http_response_code(401);
    echo json_encode(['error' => 'Authentication failed']);
} catch (\Stripe\Exception\ApiConnectionException $e) {
    // Network communication with Stripe failed
    http_response_code(500);
    echo json_encode(['error' => 'Network error']);
} catch (\Stripe\Exception\ApiErrorException $e) {
    // Display a very generic error to the user, and maybe send
    // yourself an email
    http_response_code(500);
    echo json_encode(['error' => 'Payment processing error']);
} catch (Exception $e) {
    // Something else happened, completely unrelated to Stripe
    http_response_code(500);
    echo json_encode(['error' => 'An unexpected error occurred']);
}
?>
