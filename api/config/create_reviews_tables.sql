-- Product Reviews & Ratings System Database Schema
-- Run this SQL in your database (phpMyAdmin, MySQL Workbench, or command line)

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS `product_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `review_title` VARCHAR(255) NULL,
    `review_text` TEXT NULL,
    `is_verified_purchase` BOOLEAN DEFAULT FALSE,
    `is_approved` BOOLEAN DEFAULT TRUE,
    `helpful_count` INT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_product_review` (`user_id`, `product_id`),
    KEY `idx_product_reviews_product_id` (`product_id`),
    KEY `idx_product_reviews_user_id` (`user_id`),
    KEY `idx_product_reviews_rating` (`rating`),
    KEY `idx_product_reviews_created_at` (`created_at`),
    KEY `idx_product_reviews_approved` (`is_approved`),
    CONSTRAINT `fk_product_reviews_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_product_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create review_helpfulness table for tracking helpful votes
CREATE TABLE IF NOT EXISTS `review_helpfulness` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `review_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `is_helpful` BOOLEAN NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_review_vote` (`user_id`, `review_id`),
    KEY `idx_review_helpfulness_review_id` (`review_id`),
    KEY `idx_review_helpfulness_user_id` (`user_id`),
    CONSTRAINT `fk_review_helpfulness_review_id` FOREIGN KEY (`review_id`) REFERENCES `product_reviews` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_helpfulness_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create trigger to update helpful_count when helpfulness votes change
DELIMITER $$

CREATE TRIGGER `update_helpful_count_after_insert` 
AFTER INSERT ON `review_helpfulness`
FOR EACH ROW
BEGIN
    UPDATE `product_reviews` 
    SET `helpful_count` = (
        SELECT COUNT(*) 
        FROM `review_helpfulness` 
        WHERE `review_id` = NEW.`review_id` AND `is_helpful` = TRUE
    )
    WHERE `id` = NEW.`review_id`;
END$$

CREATE TRIGGER `update_helpful_count_after_update` 
AFTER UPDATE ON `review_helpfulness`
FOR EACH ROW
BEGIN
    UPDATE `product_reviews` 
    SET `helpful_count` = (
        SELECT COUNT(*) 
        FROM `review_helpfulness` 
        WHERE `review_id` = NEW.`review_id` AND `is_helpful` = TRUE
    )
    WHERE `id` = NEW.`review_id`;
END$$

CREATE TRIGGER `update_helpful_count_after_delete` 
AFTER DELETE ON `review_helpfulness`
FOR EACH ROW
BEGIN
    UPDATE `product_reviews` 
    SET `helpful_count` = (
        SELECT COUNT(*) 
        FROM `review_helpfulness` 
        WHERE `review_id` = OLD.`review_id` AND `is_helpful` = TRUE
    )
    WHERE `id` = OLD.`review_id`;
END$$

DELIMITER ;

-- Insert sample reviews for testing (optional - uncomment if you want sample data)
/*
-- Sample reviews (replace user_id and product_id with actual values from your database)
INSERT INTO `product_reviews` (`product_id`, `user_id`, `rating`, `review_title`, `review_text`, `is_verified_purchase`) VALUES
(1, 1, 5, 'Excellent product!', 'This brake pad set exceeded my expectations. Great quality and perfect fit for my vehicle. Installation was straightforward and they work perfectly.', TRUE),
(1, 2, 4, 'Good value for money', 'Solid product for the price. Installation was straightforward and they seem to be working well so far. Would recommend.', TRUE),
(1, 3, 5, 'Perfect fit', 'Exactly what I needed. High quality parts and fast shipping. Very satisfied with this purchase.', TRUE),
(2, 1, 4, 'Quality oil filter', 'Good quality filter that fits perfectly. Easy to install and seems well made. Happy with the purchase.', TRUE),
(2, 2, 5, 'Great filter', 'Excellent oil filter. High quality construction and perfect fit. Will definitely buy again.', FALSE),
(3, 1, 3, 'Average product', 'The product is okay but nothing special. Does the job but could be better quality for the price.', TRUE),
(3, 3, 4, 'Good headlight', 'Nice bright headlight assembly. Installation took some time but the result is great. Good value.', TRUE);

-- Sample helpfulness votes (optional)
INSERT INTO `review_helpfulness` (`review_id`, `user_id`, `is_helpful`) VALUES
(1, 2, TRUE),
(1, 3, TRUE),
(2, 1, TRUE),
(2, 3, FALSE),
(3, 2, TRUE),
(4, 3, TRUE),
(5, 1, TRUE),
(6, 2, FALSE),
(7, 1, TRUE);
*/

-- Verify the tables were created correctly
SHOW TABLES LIKE '%review%';

-- Show the structure of the created tables
DESCRIBE `product_reviews`;
DESCRIBE `review_helpfulness`;

-- Show sample data count (will be 0 if no sample data inserted)
SELECT 
    (SELECT COUNT(*) FROM `product_reviews`) as total_reviews,
    (SELECT COUNT(*) FROM `review_helpfulness`) as total_votes;

-- Show indexes
SHOW INDEX FROM `product_reviews`;
SHOW INDEX FROM `review_helpfulness`;
