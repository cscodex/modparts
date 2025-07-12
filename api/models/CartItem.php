<?php
class CartItem {
    private $conn;
    private $table_name = "cart_items";

    public $id;
    public $user_id;
    public $product_id;
    public $quantity;
    public $created_at;
    public $updated_at;

    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;

        // Ensure the cart_items table exists
        $this->ensureTableExists();
    }

    // Ensure the cart_items table exists
    private function ensureTableExists() {
        try {
            // Check if table exists before creating
            $tableCheck = $this->conn->query("SHOW TABLES LIKE '" . $this->table_name . "'");
            
            if ($tableCheck->rowCount() == 0) {
                // Table doesn't exist, create it
                error_log("CartItem: Table doesn't exist, creating it");
                
                // Create the table
                $createTable = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    product_id INT NOT NULL,
                    quantity INT NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY user_product (user_id, product_id)
                )";

                $result = $this->conn->exec($createTable);
                error_log("CartItem: Table creation result: " . ($result !== false ? "Success" : "Failed"));
            } else {
                error_log("CartItem: Table already exists, skipping creation");
            }
        } catch (PDOException $e) {
            error_log("CartItem: Error checking/creating table: " . $e->getMessage());
        }
    }

    // Get cart items for a user
    public function getUserCart() {
        try {
            $query = "SELECT ci.id, ci.user_id, ci.product_id, ci.quantity,
                            p.name, p.price, p.image_url, p.quantity as stock_quantity
                    FROM " . $this->table_name . " ci
                    LEFT JOIN products p ON ci.product_id = p.id
                    WHERE ci.user_id = ?
                    ORDER BY ci.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->user_id);
            $stmt->execute();

            return $stmt;
        } catch (PDOException $e) {
            error_log("Error in getUserCart: " . $e->getMessage());
            return null;
        }
    }

    // Add item to cart
    public function addToCart() {
        try {
            // Debug logging with detailed information
            error_log("CartItem::addToCart - Starting with user_id: " . $this->user_id . " (type: " . gettype($this->user_id) . "), product_id: " . $this->product_id . ", quantity: " . $this->quantity);
            error_log("CartItem::addToCart - Session ID: " . session_id());
            error_log("CartItem::addToCart - Table name: " . $this->table_name);
            error_log("CartItem::addToCart - Session data: " . print_r($_SESSION, true));

            // Log database connection status
            error_log("CartItem::addToCart - Database connection: " . ($this->conn ? "Valid" : "Invalid"));

            // Test database connection with a simple query
            try {
                $testQuery = "SELECT 1";
                $testStmt = $this->conn->query($testQuery);
                error_log("CartItem::addToCart - Database connection test: " . ($testStmt ? "Success" : "Failed"));
            } catch (PDOException $testEx) {
                error_log("CartItem::addToCart - Database connection test exception: " . $testEx->getMessage());
            }

            // Validate user_id
            if (empty($this->user_id) || !is_numeric($this->user_id)) {
                error_log("CartItem::addToCart - Invalid user_id: " . $this->user_id);
                return false;
            }

            // First check if the item already exists in the cart
            $check_query = "SELECT id, quantity FROM " . $this->table_name . "
                            WHERE user_id = ? AND product_id = ?";

            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(1, $this->user_id);
            $check_stmt->bindParam(2, $this->product_id);
            $check_stmt->execute();

            error_log("CartItem::addToCart - Check query executed, found rows: " . $check_stmt->rowCount());
            error_log("CartItem::addToCart - SQL: " . $check_query . " with params: " . $this->user_id . ", " . $this->product_id);

            if ($check_stmt->rowCount() > 0) {
                // Item exists, update quantity
                $row = $check_stmt->fetch(PDO::FETCH_ASSOC);
                $this->id = $row['id'];
                $new_quantity = $row['quantity'] + $this->quantity;

                error_log("CartItem::addToCart - Updating existing item ID: " . $this->id . " with new quantity: " . $new_quantity);
                return $this->updateQuantity($new_quantity);
            } else {
                // Item doesn't exist, insert new
                $query = "INSERT INTO " . $this->table_name . "
                        (user_id, product_id, quantity)
                        VALUES (?, ?, ?)";

                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(1, $this->user_id);
                $stmt->bindParam(2, $this->product_id);
                $stmt->bindParam(3, $this->quantity);

                error_log("CartItem::addToCart - Inserting new item for user_id: " . $this->user_id);
                error_log("CartItem::addToCart - SQL: " . $query . " with params: " . $this->user_id . ", " . $this->product_id . ", " . $this->quantity);

                // Log the exact SQL that would be executed with values
                $debugSql = "INSERT INTO " . $this->table_name . " (user_id, product_id, quantity) VALUES (" .
                    $this->user_id . ", " . $this->product_id . ", " . $this->quantity . ")";
                error_log("CartItem::addToCart - Exact SQL to execute: " . $debugSql);

                // Check if table exists before executing
                try {
                    $tableCheck = $this->conn->query("SHOW TABLES LIKE '" . $this->table_name . "'");
                    error_log("CartItem::addToCart - Table check result: " . ($tableCheck->rowCount() > 0 ? "Table exists" : "Table does not exist"));

                    if ($tableCheck->rowCount() == 0) {
                        // Table doesn't exist, log this critical error
                        error_log("CartItem::addToCart - CRITICAL: Table '" . $this->table_name . "' does not exist!");
                    }
                } catch (PDOException $tableEx) {
                    error_log("CartItem::addToCart - Error checking table existence: " . $tableEx->getMessage());
                }

                // Execute the statement and log detailed information
                error_log("CartItem::addToCart - Executing prepared statement");
                $result = $stmt->execute();

                // Check for errors
                if (!$result) {
                    $errorInfo = $stmt->errorInfo();
                    error_log("CartItem::addToCart - Insert failed with error code: " . $errorInfo[0]);
                    error_log("CartItem::addToCart - SQL State: " . $errorInfo[1]);
                    error_log("CartItem::addToCart - Error message: " . $errorInfo[2]);

                    // Try direct SQL execution as a fallback
                    error_log("CartItem::addToCart - Trying direct SQL execution as fallback");
                    try {
                        $directResult = $this->conn->exec($debugSql);
                        if ($directResult !== false) {
                            $this->id = $this->conn->lastInsertId();
                            error_log("CartItem::addToCart - Direct SQL insert successful, new ID: " . $this->id);
                            return true;
                        } else {
                            $directErrorInfo = $this->conn->errorInfo();
                            error_log("CartItem::addToCart - Direct SQL insert also failed with error code: " . $directErrorInfo[0]);
                            error_log("CartItem::addToCart - SQL State: " . $directErrorInfo[1]);
                            error_log("CartItem::addToCart - Error message: " . $directErrorInfo[2]);
                        }
                    } catch (PDOException $directEx) {
                        error_log("CartItem::addToCart - Direct SQL exception: " . $directEx->getMessage());
                        error_log("CartItem::addToCart - Exception code: " . $directEx->getCode());
                    }

                    return false;
                }

                $this->id = $this->conn->lastInsertId();
                error_log("CartItem::addToCart - Insert successful, new ID: " . $this->id);

                // Double-check that the item was actually inserted
                $verify_query = "SELECT id FROM " . $this->table_name . " WHERE id = ?";
                $verify_stmt = $this->conn->prepare($verify_query);
                $verify_stmt->bindParam(1, $this->id);
                $verify_stmt->execute();

                if ($verify_stmt->rowCount() > 0) {
                    error_log("CartItem::addToCart - Verified insert successful");
                    return true;
                } else {
                    error_log("CartItem::addToCart - Insert verification failed");

                    // Try to find out if the table exists and has the right structure
                    try {
                        $tableCheck = $this->conn->query("SHOW TABLES LIKE '" . $this->table_name . "'");
                        if ($tableCheck->rowCount() == 0) {
                            error_log("CartItem::addToCart - Table '" . $this->table_name . "' does not exist!");

                            // Try to create the table
                            $createTable = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                user_id INT NOT NULL,
                                product_id INT NOT NULL,
                                quantity INT NOT NULL DEFAULT 1,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                            )";

                            $createResult = $this->conn->exec($createTable);
                            error_log("CartItem::addToCart - Table creation result: " . ($createResult !== false ? "Success" : "Failed"));
                        } else {
                            // Check table structure
                            $describeTable = $this->conn->query("DESCRIBE " . $this->table_name);
                            $columns = [];
                            while ($col = $describeTable->fetch(PDO::FETCH_ASSOC)) {
                                $columns[] = $col['Field'];
                            }
                            error_log("CartItem::addToCart - Table columns: " . implode(", ", $columns));
                        }
                    } catch (PDOException $tableEx) {
                        error_log("CartItem::addToCart - Error checking table: " . $tableEx->getMessage());
                    }

                    return false;
                }
            }
        } catch (PDOException $e) {
            error_log("Error in addToCart: " . $e->getMessage());
            return false;
        }
    }

    // Update cart item quantity
    public function updateQuantity($quantity) {
        try {
            error_log("CartItem::updateQuantity - Updating item ID: " . $this->id . " to quantity: " . $quantity);

            $query = "UPDATE " . $this->table_name . "
                    SET quantity = ?
                    WHERE id = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $quantity);
            $stmt->bindParam(2, $this->id);

            $result = $stmt->execute();
            error_log("CartItem::updateQuantity - Update " . ($result ? "successful" : "failed") . " for ID: " . $this->id);

            return $result;
        } catch (PDOException $e) {
            error_log("Error in updateQuantity: " . $e->getMessage());
            return false;
        }
    }

    // Remove item from cart
    public function removeFromCart() {
        try {
            $query = "DELETE FROM " . $this->table_name . "
                    WHERE id = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->id);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in removeFromCart: " . $e->getMessage());
            return false;
        }
    }

    // Clear user's cart
    public function clearCart() {
        try {
            $query = "DELETE FROM " . $this->table_name . "
                    WHERE user_id = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->user_id);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in clearCart: " . $e->getMessage());
            return false;
        }
    }

    // Check if product is in stock
    public function checkStock() {
        try {
            $query = "SELECT quantity FROM products WHERE id = ? LIMIT 1";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->product_id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row['quantity'] >= $this->quantity;
            }

            return false;
        } catch (PDOException $e) {
            error_log("Error in checkStock: " . $e->getMessage());
            return false;
        }
    }
}
?>
