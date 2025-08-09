<?php
// Review Helpfulness API Endpoint
// Handles voting on review helpfulness

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
    $review_id = $_GET['review_id'] ?? null;
    
    switch ($method) {
        case 'GET':
            getHelpfulnessVotes($pdo, $review_id);
            break;
            
        case 'POST':
            voteHelpfulness($pdo, $input);
            break;
            
        case 'PUT':
            updateHelpfulnessVote($pdo, $input);
            break;
            
        case 'DELETE':
            removeHelpfulnessVote($pdo, $review_id);
            break;
            
        default:
            sendResponse(405, false, 'Method not allowed');
    }

} catch (Exception $e) {
    error_log('Review helpfulness API error: ' . $e->getMessage());
    sendResponse(500, false, 'Internal server error: ' . $e->getMessage());
}

// Get helpfulness votes for a review
function getHelpfulnessVotes($pdo, $reviewId) {
    try {
        if (!$reviewId) {
            sendResponse(400, false, 'Review ID is required');
            return;
        }
        
        // Get vote counts
        $stmt = $pdo->prepare("
            SELECT 
                SUM(CASE WHEN is_helpful = true THEN 1 ELSE 0 END) as helpful_count,
                SUM(CASE WHEN is_helpful = false THEN 1 ELSE 0 END) as not_helpful_count,
                COUNT(*) as total_votes
            FROM review_helpfulness 
            WHERE review_id = ?
        ");
        
        $stmt->execute([$reviewId]);
        $votes = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse(200, true, 'Helpfulness votes retrieved successfully', [
            'reviewId' => (int)$reviewId,
            'helpfulCount' => (int)($votes['helpful_count'] ?? 0),
            'notHelpfulCount' => (int)($votes['not_helpful_count'] ?? 0),
            'totalVotes' => (int)($votes['total_votes'] ?? 0)
        ]);

    } catch (Exception $e) {
        error_log('Error in getHelpfulnessVotes: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to retrieve helpfulness votes');
    }
}

// Vote on review helpfulness
function voteHelpfulness($pdo, $input) {
    try {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Authentication required');
            return;
        }
        
        $userId = $_SESSION['user_id'];
        $reviewId = $input['review_id'] ?? null;
        $isHelpful = $input['is_helpful'] ?? null;
        
        // Validate required fields
        if (!$reviewId || !is_bool($isHelpful)) {
            sendResponse(400, false, 'Review ID and is_helpful (boolean) are required');
            return;
        }
        
        // Check if review exists
        $reviewStmt = $pdo->prepare("SELECT id FROM product_reviews WHERE id = ?");
        $reviewStmt->execute([$reviewId]);
        
        if (!$reviewStmt->fetch()) {
            sendResponse(404, false, 'Review not found');
            return;
        }
        
        // Check if user has already voted on this review
        $existingStmt = $pdo->prepare("
            SELECT id, is_helpful 
            FROM review_helpfulness 
            WHERE user_id = ? AND review_id = ?
        ");
        $existingStmt->execute([$userId, $reviewId]);
        $existingVote = $existingStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingVote) {
            // Update existing vote if different
            if ($existingVote['is_helpful'] != $isHelpful) {
                $updateStmt = $pdo->prepare("
                    UPDATE review_helpfulness 
                    SET is_helpful = ? 
                    WHERE id = ?
                ");
                $updateStmt->execute([$isHelpful, $existingVote['id']]);
                
                // Update helpful count in product_reviews
                updateHelpfulCount($pdo, $reviewId);
                
                sendResponse(200, true, 'Vote updated successfully', [
                    'reviewId' => (int)$reviewId,
                    'isHelpful' => $isHelpful
                ]);
            } else {
                sendResponse(400, false, 'You have already voted this way on this review');
            }
        } else {
            // Create new vote
            $insertStmt = $pdo->prepare("
                INSERT INTO review_helpfulness (review_id, user_id, is_helpful)
                VALUES (?, ?, ?)
            ");
            $insertStmt->execute([$reviewId, $userId, $isHelpful]);
            
            // Update helpful count in product_reviews
            updateHelpfulCount($pdo, $reviewId);
            
            sendResponse(201, true, 'Vote recorded successfully', [
                'reviewId' => (int)$reviewId,
                'isHelpful' => $isHelpful
            ]);
        }

    } catch (Exception $e) {
        error_log('Error in voteHelpfulness: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to record vote');
    }
}

// Update helpfulness vote
function updateHelpfulnessVote($pdo, $input) {
    try {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Authentication required');
            return;
        }
        
        $userId = $_SESSION['user_id'];
        $reviewId = $input['review_id'] ?? null;
        $isHelpful = $input['is_helpful'] ?? null;
        
        // Validate required fields
        if (!$reviewId || !is_bool($isHelpful)) {
            sendResponse(400, false, 'Review ID and is_helpful (boolean) are required');
            return;
        }
        
        // Find existing vote
        $existingStmt = $pdo->prepare("
            SELECT id 
            FROM review_helpfulness 
            WHERE user_id = ? AND review_id = ?
        ");
        $existingStmt->execute([$userId, $reviewId]);
        $existingVote = $existingStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existingVote) {
            sendResponse(404, false, 'Vote not found');
            return;
        }
        
        // Update the vote
        $updateStmt = $pdo->prepare("
            UPDATE review_helpfulness 
            SET is_helpful = ? 
            WHERE id = ?
        ");
        $updateStmt->execute([$isHelpful, $existingVote['id']]);
        
        // Update helpful count in product_reviews
        updateHelpfulCount($pdo, $reviewId);
        
        sendResponse(200, true, 'Vote updated successfully', [
            'reviewId' => (int)$reviewId,
            'isHelpful' => $isHelpful
        ]);

    } catch (Exception $e) {
        error_log('Error in updateHelpfulnessVote: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to update vote');
    }
}

// Remove helpfulness vote
function removeHelpfulnessVote($pdo, $reviewId) {
    try {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            sendResponse(401, false, 'Authentication required');
            return;
        }
        
        $userId = $_SESSION['user_id'];
        
        if (!$reviewId) {
            sendResponse(400, false, 'Review ID is required');
            return;
        }
        
        // Find and delete the vote
        $deleteStmt = $pdo->prepare("
            DELETE FROM review_helpfulness 
            WHERE user_id = ? AND review_id = ?
        ");
        $deleteStmt->execute([$userId, $reviewId]);
        
        // Update helpful count in product_reviews
        updateHelpfulCount($pdo, $reviewId);
        
        sendResponse(200, true, 'Vote removed successfully');

    } catch (Exception $e) {
        error_log('Error in removeHelpfulnessVote: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to remove vote');
    }
}

// Helper function to update helpful count
function updateHelpfulCount($pdo, $reviewId) {
    try {
        $countStmt = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM review_helpfulness 
            WHERE review_id = ? AND is_helpful = true
        ");
        $countStmt->execute([$reviewId]);
        $helpfulCount = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $updateStmt = $pdo->prepare("
            UPDATE product_reviews 
            SET helpful_count = ? 
            WHERE id = ?
        ");
        $updateStmt->execute([$helpfulCount, $reviewId]);
        
    } catch (Exception $e) {
        error_log('Error updating helpful count: ' . $e->getMessage());
    }
}

// Get user's vote on a specific review
function getUserVote($pdo, $reviewId, $userId) {
    try {
        if (!$reviewId) {
            sendResponse(400, false, 'Review ID is required');
            return;
        }
        
        // Get user's vote
        $stmt = $pdo->prepare("
            SELECT is_helpful 
            FROM review_helpfulness 
            WHERE user_id = ? AND review_id = ?
        ");
        $stmt->execute([$userId, $reviewId]);
        $vote = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse(200, true, 'User vote retrieved successfully', [
            'reviewId' => (int)$reviewId,
            'userVote' => $vote ? (bool)$vote['is_helpful'] : null
        ]);

    } catch (Exception $e) {
        error_log('Error in getUserVote: ' . $e->getMessage());
        sendResponse(500, false, 'Failed to get user vote');
    }
}
?>
