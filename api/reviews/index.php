<?php
// Product Reviews API Endpoint
// Handles CRUD operations for product reviews and ratings

require_once '../includes/cors_headers.php';
require_once '../config/database.php';
require_once '../includes/response.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Get query parameters
    $product_id = $_GET['product_id'] ?? null;
    $review_id = $_GET['review_id'] ?? null;
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 10);
    $sort = $_GET['sort'] ?? 'newest';
    $status = $_GET['status'] ?? 'all';
    
    switch ($method) {
        case 'GET':
            if ($product_id) {
                getProductReviews($pdo, $product_id, $page, $limit, $sort);
            } elseif ($review_id) {
                getReviewById($pdo, $review_id);
            } else {
                getAllReviews($pdo, $page, $limit, $status);
            }
            break;
            
        case 'POST':
            createReview($pdo, $input);
            break;
            
        case 'PUT':
            if ($review_id) {
                updateReview($pdo, $review_id, $input);
            } else {
                sendResponse(400, false, 'Review ID is required for updates');
            }
            break;
            
        case 'DELETE':
            if ($review_id) {
                deleteReview($pdo, $review_id);
            } else {
                sendResponse(400, false, 'Review ID is required for deletion');
            }
            break;
            
        default:
            sendResponse(405, false, 'Method not allowed');
    }

} catch (Exception $e) {
    error_log('Reviews API error: ' . $e->getMessage());
    sendResponse(500, false, 'Internal server error: ' . $e->getMessage());
}

// Get reviews for a specific product
function getProductReviews($pdo, $productId, $page, $limit, $sort) {
    try {
        $offset = ($page - 1) * $limit;
        
        // Build sort order
        $orderBy = 'created_at DESC';
        switch ($sort) {
            case 'oldest':
                $orderBy = 'created_at ASC';
                break;
            case 'highest_rating':
                $orderBy = 'rating DESC, created_at DESC';
                break;
            case 'lowest_rating':
                $orderBy = 'rating ASC, created_at DESC';
                break;
            case 'most_helpful':
                $orderBy = 'helpful_count DESC, created_at DESC';
                break;
            default:
                $orderBy = 'created_at DESC';
        }
        
        // Get reviews with user information
        $stmt = $pdo->prepare("
            SELECT 
                pr.id,
                pr.rating,
                pr.review_title,
                pr.review_text,
                pr.is_verified_purchase,
                pr.helpful_count,
                pr.created_at,
                pr.updated_at,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email
            FROM product_reviews pr
            LEFT JOIN users u ON pr.user_id = u.id
            WHERE pr.product_id = ? AND pr.is_approved = true
            ORDER BY {$orderBy}
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute([$productId, $limit, $offset]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count
        $countStmt = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM product_reviews 
            WHERE product_id = ? AND is_approved = true
        ");
        $countStmt->execute([$productId]);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get rating statistics
        $statsStmt = $pdo->prepare("
            SELECT 
                COALESCE(AVG(rating), 0) as average_rating,
                COUNT(*) as total_reviews,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
            FROM product_reviews 
            WHERE product_id = ? AND is_approved = true
        ");
        $statsStmt->execute([$productId]);
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
        
        // Format reviews data
        $formattedReviews = array_map(function($review) {
            return [
                'id' => (int)$review['id'],
                'rating' => (int)$review['rating'],
                'title' => $review['review_title'],
                'text' => $review['review_text'],
                'isVerifiedPurchase' => (bool)$review['is_verified_purchase'],
                'helpfulCount' => (int)$review['helpful_count'],
                'createdAt' => $review['created_at'],
                'updatedAt' => $review['updated_at'],
                'user' => [
                    'id' => $review['user_id'],
                    'name' => trim(($review['first_name'] ?? '') . ' ' . ($review['last_name'] ?? '')) ?: 'Anonymous',
                    'email' => $review['email']
                ]
            ];
        }, $reviews);
        
        $ratingDistribution = [
            '1' => (int)$stats['rating_1'],
            '2' => (int)$stats['rating_2'],
            '3' => (int)$stats['rating_3'],
            '4' => (int)$stats['rating_4'],
            '5' => (int)$stats['rating_5']
        ];
        
        sendResponse(200, true, 'Reviews retrieved successfully', [
            'reviews' => $formattedReviews,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ],
            'statistics' => [
                'averageRating' => round((float)$stats['average_rating'], 2),
                'totalReviews' => (int)$stats['total_reviews'],
                'ratingDistribution' => $ratingDistribution
            ]
        ]);

    } catch (Exception $e) {
        error_log('Error in getProductReviews: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to retrieve reviews');
    }
}

// Create a new review
function createReview($pdo, $input) {
    try {
        // Get user from session or token
        session_start();
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Authentication required');
            return;
        }
        
        $userId = $_SESSION['user_id'];
        $productId = $input['product_id'] ?? null;
        $rating = $input['rating'] ?? null;
        $reviewTitle = $input['review_title'] ?? null;
        $reviewText = $input['review_text'] ?? null;
        
        // Validate required fields
        if (!$productId || !$rating || $rating < 1 || $rating > 5) {
            sendResponse(400, false, 'Product ID and valid rating (1-5) are required');
            return;
        }
        
        // Check if user has already reviewed this product
        $checkStmt = $pdo->prepare("
            SELECT id FROM product_reviews 
            WHERE user_id = ? AND product_id = ?
        ");
        $checkStmt->execute([$userId, $productId]);
        
        if ($checkStmt->fetch()) {
            sendResponse(400, false, 'You have already reviewed this product');
            return;
        }
        
        // Check if user has purchased this product (verified purchase)
        $purchaseStmt = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('delivered', 'completed')
        ");
        $purchaseStmt->execute([$userId, $productId]);
        $isVerifiedPurchase = $purchaseStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
        
        // Create the review
        $stmt = $pdo->prepare("
            INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $productId,
            $userId,
            $rating,
            $reviewTitle,
            $reviewText,
            $isVerifiedPurchase
        ]);
        
        $reviewId = $pdo->lastInsertId();
        
        // Get the created review with user info
        $getStmt = $pdo->prepare("
            SELECT 
                pr.id,
                pr.rating,
                pr.review_title,
                pr.review_text,
                pr.is_verified_purchase,
                pr.helpful_count,
                pr.created_at,
                u.first_name,
                u.last_name
            FROM product_reviews pr
            LEFT JOIN users u ON pr.user_id = u.id
            WHERE pr.id = ?
        ");
        $getStmt->execute([$reviewId]);
        $review = $getStmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse(201, true, 'Review created successfully', [
            'id' => (int)$review['id'],
            'rating' => (int)$review['rating'],
            'title' => $review['review_title'],
            'text' => $review['review_text'],
            'isVerifiedPurchase' => (bool)$review['is_verified_purchase'],
            'helpfulCount' => (int)$review['helpful_count'],
            'createdAt' => $review['created_at'],
            'user' => [
                'name' => trim(($review['first_name'] ?? '') . ' ' . ($review['last_name'] ?? '')) ?: 'Anonymous'
            ]
        ]);

    } catch (Exception $e) {
        error_log('Error in createReview: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to create review');
    }
}

// Update an existing review
function updateReview($pdo, $reviewId, $input) {
    try {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Authentication required');
            return;
        }
        
        $userId = $_SESSION['user_id'];
        
        // Check if user is admin or review owner
        $checkStmt = $pdo->prepare("
            SELECT pr.user_id, u.role 
            FROM product_reviews pr
            LEFT JOIN users u ON u.id = ?
            WHERE pr.id = ?
        ");
        $checkStmt->execute([$userId, $reviewId]);
        $reviewData = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reviewData) {
            sendResponse(404, false, 'Review not found');
            return;
        }
        
        $isAdmin = $reviewData['role'] === 'admin';
        $isOwner = $reviewData['user_id'] === $userId;
        
        if (!$isAdmin && !$isOwner) {
            sendResponse(403, false, 'Not authorized to update this review');
            return;
        }
        
        // Build update query
        $updateFields = [];
        $updateValues = [];
        
        if (isset($input['rating']) && $input['rating'] >= 1 && $input['rating'] <= 5) {
            $updateFields[] = 'rating = ?';
            $updateValues[] = $input['rating'];
        }
        
        if (isset($input['review_title'])) {
            $updateFields[] = 'review_title = ?';
            $updateValues[] = $input['review_title'];
        }
        
        if (isset($input['review_text'])) {
            $updateFields[] = 'review_text = ?';
            $updateValues[] = $input['review_text'];
        }
        
        // Only admins can update approval status
        if (isset($input['is_approved']) && $isAdmin) {
            $updateFields[] = 'is_approved = ?';
            $updateValues[] = $input['is_approved'];
        }
        
        if (empty($updateFields)) {
            sendResponse(400, false, 'No valid fields to update');
            return;
        }
        
        $updateValues[] = $reviewId;
        
        $stmt = $pdo->prepare("
            UPDATE product_reviews 
            SET " . implode(', ', $updateFields) . ", updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute($updateValues);
        
        sendResponse(200, true, 'Review updated successfully');

    } catch (Exception $e) {
        error_log('Error in updateReview: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to update review');
    }
}

// Delete a review
function deleteReview($pdo, $reviewId) {
    try {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Authentication required');
            return;
        }
        
        $userId = $_SESSION['user_id'];
        
        // Check if user is admin or review owner
        $checkStmt = $pdo->prepare("
            SELECT pr.user_id, u.role 
            FROM product_reviews pr
            LEFT JOIN users u ON u.id = ?
            WHERE pr.id = ?
        ");
        $checkStmt->execute([$userId, $reviewId]);
        $reviewData = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reviewData) {
            sendResponse(404, false, 'Review not found');
            return;
        }
        
        $isAdmin = $reviewData['role'] === 'admin';
        $isOwner = $reviewData['user_id'] === $userId;
        
        if (!$isAdmin && !$isOwner) {
            sendResponse(403, false, 'Not authorized to delete this review');
            return;
        }
        
        // Delete the review
        $stmt = $pdo->prepare("DELETE FROM product_reviews WHERE id = ?");
        $stmt->execute([$reviewId]);
        
        sendResponse(200, true, 'Review deleted successfully');

    } catch (Exception $e) {
        error_log('Error in deleteReview: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to delete review');
    }
}

// Get all reviews (admin only)
function getAllReviews($pdo, $page, $limit, $status) {
    try {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Authentication required');
            return;
        }
        
        // Check if user is admin
        $userStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $userStmt->execute([$_SESSION['user_id']]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || $user['role'] !== 'admin') {
            sendResponse(403, false, 'Admin access required');
            return;
        }
        
        $offset = ($page - 1) * $limit;
        
        // Build WHERE clause based on status filter
        $whereClause = '';
        $params = [];
        
        if ($status === 'pending') {
            $whereClause = 'WHERE pr.is_approved = false';
        } elseif ($status === 'approved') {
            $whereClause = 'WHERE pr.is_approved = true';
        }
        
        // Get reviews
        $stmt = $pdo->prepare("
            SELECT 
                pr.id,
                pr.product_id,
                pr.rating,
                pr.review_title,
                pr.review_text,
                pr.is_verified_purchase,
                pr.is_approved,
                pr.helpful_count,
                pr.created_at,
                pr.updated_at,
                u.first_name,
                u.last_name,
                u.email,
                p.name as product_name
            FROM product_reviews pr
            LEFT JOIN users u ON pr.user_id = u.id
            LEFT JOIN products p ON pr.product_id = p.id
            {$whereClause}
            ORDER BY pr.created_at DESC
            LIMIT ? OFFSET ?
        ");
        
        $executeParams = array_merge($params, [$limit, $offset]);
        $stmt->execute($executeParams);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count
        $countStmt = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM product_reviews pr
            {$whereClause}
        ");
        $countStmt->execute($params);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        sendResponse(200, true, 'Reviews retrieved successfully', [
            'reviews' => $reviews,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$totalCount,
                'totalPages' => ceil($totalCount / $limit)
            ]
        ]);

    } catch (Exception $e) {
        error_log('Error in getAllReviews: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to retrieve reviews');
    }
}

// Get single review by ID
function getReviewById($pdo, $reviewId) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                pr.id,
                pr.product_id,
                pr.rating,
                pr.review_title,
                pr.review_text,
                pr.is_verified_purchase,
                pr.is_approved,
                pr.helpful_count,
                pr.created_at,
                pr.updated_at,
                u.first_name,
                u.last_name,
                u.email,
                p.name as product_name
            FROM product_reviews pr
            LEFT JOIN users u ON pr.user_id = u.id
            LEFT JOIN products p ON pr.product_id = p.id
            WHERE pr.id = ?
        ");
        
        $stmt->execute([$reviewId]);
        $review = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$review) {
            sendResponse(404, false, 'Review not found');
            return;
        }
        
        sendResponse(200, true, 'Review retrieved successfully', $review);

    } catch (Exception $e) {
        error_log('Error in getReviewById: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to retrieve review');
    }
}
?>
