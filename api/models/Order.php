<?php
class Order {
    private $conn;
    private $table_name = "orders";
    private $items_table = "order_items";

    public $id;
    public $user_id;
    public $total_amount;
    public $status;
    public $shipping_address;
    public $payment_method;
    public $created_at;
    public $updated_at;
    public $items = [];

    public function __construct($db) {
        $this->conn = $db;

        // Temporarily disable table recreation for testing
        // $this->ensureTablesExist();

        // Just check if tables exist without recreating them
        $this->checkTablesExist();
    }

    // Check if tables exist and create them if they don't
    private function checkTablesExist() {
        error_log("Order::checkTablesExist - Checking if tables exist");

        try {
            // Check if orders table exists
            $ordersTableCheck = $this->conn->query("SHOW TABLES LIKE '" . $this->table_name . "'");
            if ($ordersTableCheck->rowCount() === 0) {
                error_log("Order::checkTablesExist - Orders table does not exist, creating it");

                // Create orders table
                $ordersTableSql = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'pending',
                    shipping_address TEXT NOT NULL,
                    payment_method VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )";

                $this->conn->exec($ordersTableSql);
                error_log("Order::checkTablesExist - Orders table created");
            } else {
                error_log("Order: Table '" . $this->table_name . "' exists");
            }

            // Check if order_items table exists
            $orderItemsTableCheck = $this->conn->query("SHOW TABLES LIKE '" . $this->items_table . "'");
            if ($orderItemsTableCheck->rowCount() === 0) {
                error_log("Order::checkTablesExist - Order items table does not exist, creating it");

                // Create order_items table
                $orderItemsTableSql = "CREATE TABLE IF NOT EXISTS " . $this->items_table . " (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    product_id INT NOT NULL,
                    quantity INT NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES " . $this->table_name . "(id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )";

                $this->conn->exec($orderItemsTableSql);
                error_log("Order::checkTablesExist - Order items table created");
            } else {
                error_log("Order: Table '" . $this->items_table . "' exists");
            }

            error_log("Order::checkTablesExist - Tables check completed");
        } catch (PDOException $e) {
            error_log("Order::checkTablesExist - Error checking/creating tables: " . $e->getMessage());
            throw $e;
        }
    }

    // These methods are no longer needed as their functionality has been merged into checkTablesExist
    // Keeping them as stubs for backward compatibility
    private function createOrdersTable() {
        error_log("Order::createOrdersTable - This method is deprecated. Using checkTablesExist instead.");
        return $this->checkTablesExist();
    }

    private function createOrderItemsTable() {
        error_log("Order::createOrderItemsTable - This method is deprecated. Using checkTablesExist instead.");
        return true;
    }

    // Ensure the orders and order_items tables exist
    private function ensureTablesExist() {
        try {
            // Force table creation/recreation for development
            error_log("Order: Forcing table creation/recreation for development");

            // Drop tables if they exist (order_items first due to foreign key)
            $dropOrderItemsTable = "DROP TABLE IF EXISTS " . $this->items_table;
            $this->conn->exec($dropOrderItemsTable);
            error_log("Order: Order items table dropped (if it existed)");

            $dropOrdersTable = "DROP TABLE IF EXISTS " . $this->table_name;
            $this->conn->exec($dropOrdersTable);
            error_log("Order: Orders table dropped (if it existed)");

            // Create orders table
            $createOrdersTable = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                shipping_address TEXT NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";

            $result = $this->conn->exec($createOrdersTable);
            error_log("Order: Orders table creation result: " . ($result !== false ? "Success" : "Failed"));

            // Create order_items table
            $createOrderItemsTable = "CREATE TABLE IF NOT EXISTS " . $this->items_table . " (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES " . $this->table_name . "(id) ON DELETE CASCADE
            )";

            $result = $this->conn->exec($createOrderItemsTable);
            error_log("Order: Order items table creation result: " . ($result !== false ? "Success" : "Failed"));

            // Insert a test order for development
            $testOrderInsert = "INSERT INTO " . $this->table_name . "
                (user_id, total_amount, status, shipping_address, payment_method)
                VALUES (1, 99.99, 'pending', '123 Test St, Test City, TS 12345', 'credit_card')";
            $this->conn->exec($testOrderInsert);
            $orderId = $this->conn->lastInsertId();
            error_log("Order: Test order inserted with ID: " . $orderId);

            // Insert a test order item
            $testOrderItemInsert = "INSERT INTO " . $this->items_table . "
                (order_id, product_id, quantity, price)
                VALUES (" . $orderId . ", 1, 1, 99.99)";
            $this->conn->exec($testOrderItemInsert);
            error_log("Order: Test order item inserted");

        } catch (PDOException $e) {
            error_log("Order: Error checking/creating tables: " . $e->getMessage());
        }
    }

    // Create order
    public function create() {
        error_log("Order::create - Starting order creation process");
        error_log("Order::create - User ID: " . $this->user_id);
        error_log("Order::create - Total Amount: " . $this->total_amount);
        error_log("Order::create - Status: " . $this->status);
        error_log("Order::create - Shipping Address: " . $this->shipping_address);
        error_log("Order::create - Payment Method: " . $this->payment_method);
        error_log("Order::create - Items count: " . count($this->items));

        // Check if tables exist before starting transaction
        $this->checkTablesExist();

        // Start transaction
        $this->conn->beginTransaction();
        error_log("Order::create - Transaction started");

        try {
            // Insert order
            $query = "INSERT INTO " . $this->table_name . "
                    SET
                        user_id = :user_id,
                        total_amount = :total_amount,
                        status = :status,
                        shipping_address = :shipping_address,
                        payment_method = :payment_method";

            $stmt = $this->conn->prepare($query);
            error_log("Order::create - Prepared order insert query");

            // Sanitize input
            $this->user_id = htmlspecialchars(strip_tags($this->user_id));
            $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));
            $this->status = htmlspecialchars(strip_tags($this->status));
            $this->shipping_address = htmlspecialchars(strip_tags($this->shipping_address));
            $this->payment_method = htmlspecialchars(strip_tags($this->payment_method));

            error_log("Order::create - Sanitized input values");
            error_log("Order::create - user_id: " . $this->user_id);
            error_log("Order::create - total_amount: " . $this->total_amount);
            error_log("Order::create - status: " . $this->status);

            // Bind values
            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->bindParam(":total_amount", $this->total_amount);
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":shipping_address", $this->shipping_address);
            $stmt->bindParam(":payment_method", $this->payment_method);
            error_log("Order::create - Bound parameters to order insert query");

            // Execute query
            try {
                $result = $stmt->execute();
                error_log("Order::create - Order insert query executed: " . ($result ? "Success" : "Failed"));

                if (!$result) {
                    $errorInfo = $stmt->errorInfo();
                    error_log("Order::create - Order insert error: " . print_r($errorInfo, true));
                    throw new Exception("Failed to insert order: " . (is_array($errorInfo) && isset($errorInfo[2]) ? $errorInfo[2] : "Unknown error"));
                }
            } catch (PDOException $pdoEx) {
                error_log("Order::create - PDO Exception during order insert: " . $pdoEx->getMessage());
                throw $pdoEx;
            }

            // Get the order ID
            $this->id = $this->conn->lastInsertId();
            error_log("Order::create - Got order ID: " . $this->id);

            // Insert order items
            error_log("Order::create - Starting to insert " . count($this->items) . " order items");

            foreach ($this->items as $index => $item) {
                error_log("Order::create - Processing item " . ($index + 1) . " of " . count($this->items));

                $query = "INSERT INTO " . $this->items_table . "
                        SET
                            order_id = :order_id,
                            product_id = :product_id,
                            quantity = :quantity,
                            price = :price";

                $stmt = $this->conn->prepare($query);
                error_log("Order::create - Prepared order item insert query");

                // Handle both object and array formats
                $product_id = null;
                $quantity = null;
                $price = null;

                // Check if item is an object or array and get properties accordingly
                if (is_object($item)) {
                    error_log("Order::create - Item is an object");
                    if (!isset($item->product_id)) {
                        error_log("Order::create - Missing product_id in item: " . print_r($item, true));
                        throw new Exception("Missing product_id in order item");
                    }
                    $product_id = $item->product_id;
                    $quantity = $item->quantity;
                    $price = $item->price;
                } else if (is_array($item)) {
                    error_log("Order::create - Item is an array");
                    if (!isset($item['product_id'])) {
                        error_log("Order::create - Missing product_id in item: " . print_r($item, true));
                        throw new Exception("Missing product_id in order item");
                    }
                    $product_id = $item['product_id'];
                    $quantity = $item['quantity'];
                    $price = $item['price'];
                } else {
                    error_log("Order::create - Item is neither object nor array: " . gettype($item));
                    throw new Exception("Invalid item format: " . gettype($item));
                }

                // Sanitize input
                $product_id = htmlspecialchars(strip_tags($product_id));
                $quantity = htmlspecialchars(strip_tags($quantity));
                $price = htmlspecialchars(strip_tags($price));

                error_log("Order::create - Item details: product_id=" . $product_id . ", quantity=" . $quantity . ", price=" . $price);

                // Bind values
                $stmt->bindParam(":order_id", $this->id);
                $stmt->bindParam(":product_id", $product_id);
                $stmt->bindParam(":quantity", $quantity);
                $stmt->bindParam(":price", $price);
                error_log("Order::create - Bound parameters to order item insert query");

                // Execute query
                try {
                    $result = $stmt->execute();
                    error_log("Order::create - Order item insert query executed: " . ($result ? "Success" : "Failed"));

                    if (!$result) {
                        $errorInfo = $stmt->errorInfo();
                        error_log("Order::create - Order item insert error: " . print_r($errorInfo, true));
                        throw new Exception("Failed to insert order item: " . (is_array($errorInfo) && isset($errorInfo[2]) ? $errorInfo[2] : "Unknown error"));
                    }
                } catch (PDOException $pdoEx) {
                    error_log("Order::create - PDO Exception during order item insert: " . $pdoEx->getMessage());
                    throw $pdoEx;
                }

                // Update product quantity
                $query = "UPDATE products SET quantity = quantity - :quantity WHERE id = :product_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":quantity", $quantity);
                $stmt->bindParam(":product_id", $product_id);

                try {
                    $result = $stmt->execute();
                    error_log("Order::create - Product quantity update executed: " . ($result ? "Success" : "Failed"));

                    if (!$result) {
                        $errorInfo = $stmt->errorInfo();
                        error_log("Order::create - Product quantity update error: " . print_r($errorInfo, true));
                        error_log("Order::create - Product quantity update error details: " . (is_array($errorInfo) && isset($errorInfo[2]) ? $errorInfo[2] : "Unknown error"));
                    }
                } catch (PDOException $pdoEx) {
                    error_log("Order::create - PDO Exception during product quantity update: " . $pdoEx->getMessage());
                    // Don't throw here, as we want to continue with the order even if inventory update fails
                }
            }

            // Clear the user's cart after successful order creation
            try {
                error_log("Order::create - Attempting to clear user's cart");
                $clearCartQuery = "DELETE FROM cart_items WHERE user_id = :user_id";
                $clearCartStmt = $this->conn->prepare($clearCartQuery);
                $clearCartStmt->bindParam(":user_id", $this->user_id);
                $clearResult = $clearCartStmt->execute();
                error_log("Order::create - Cart cleared: " . ($clearResult ? "Success" : "Failed"));
            } catch (Exception $cartEx) {
                error_log("Order::create - Error clearing cart: " . $cartEx->getMessage());
                // Don't throw here, as we want to continue with the order even if cart clearing fails
            }

            // Commit transaction
            $this->conn->commit();
            error_log("Order::create - Transaction committed successfully");
            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->conn->rollBack();
            error_log("Order::create - Error occurred, transaction rolled back: " . $e->getMessage());
            error_log("Order::create - Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

    // Read all orders
    public function read() {
        $query = "SELECT o.*, u.email, u.first_name, u.last_name
                FROM " . $this->table_name . " o
                LEFT JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // This duplicate method has been removed to fix the "Cannot redeclare Order::checkTablesExist()" error

    // Read orders by user
    public function readByUser() {
        error_log("Order::readByUser - Fetching orders for user ID: " . $this->user_id);

        // Check if the orders table exists
        try {
            $tableCheck = $this->conn->query("SHOW TABLES LIKE '" . $this->table_name . "'");
            if ($tableCheck->rowCount() === 0) {
                error_log("Order::readByUser - Orders table does not exist, creating it");
                $this->checkTablesExist();
            }
        } catch (PDOException $e) {
            error_log("Order::readByUser - Error checking if table exists: " . $e->getMessage());
        }

        $query = "SELECT * FROM " . $this->table_name . "
                WHERE user_id = ?
                ORDER BY created_at DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->user_id);
            $stmt->execute();

            $count = $stmt->rowCount();
            error_log("Order::readByUser - Found " . $count . " orders for user ID: " . $this->user_id);

            return $stmt;
        } catch (PDOException $e) {
            error_log("Order::readByUser - Error executing query: " . $e->getMessage());
            error_log("Order::readByUser - SQL: " . $query . " with user_id = " . $this->user_id);
            throw $e;
        }
    }

    // Read single order
    public function readOne() {
        error_log("Order::readOne - Fetching order with ID: " . $this->id);

        // Ensure status history table exists
        $this->ensureStatusHistoryTableExists();

        $query = "SELECT o.*, u.email, u.first_name, u.last_name, u.phone, u.address, u.city, u.state, u.zip_code
                FROM " . $this->table_name . " o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
                LIMIT 0,1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->id);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $this->id = $row['id'];
                $this->user_id = $row['user_id'];
                $this->total_amount = $row['total_amount'];
                $this->status = $row['status'];
                $this->shipping_address = $row['shipping_address'];
                $this->payment_method = $row['payment_method'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];

                // Get order items
                $query = "SELECT oi.*, p.name as product_name, p.image_url
                        FROM " . $this->items_table . " oi
                        LEFT JOIN products p ON oi.product_id = p.id
                        WHERE oi.order_id = ?";

                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(1, $this->id);
                $stmt->execute();

                $this->items = [];
                while ($item = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $this->items[] = $item;
                }

                // Get status history
                $statusHistory = [];
                try {
                    $historyQuery = "SELECT status, created_at FROM order_status_history
                                    WHERE order_id = ? ORDER BY created_at ASC";
                    $historyStmt = $this->conn->prepare($historyQuery);
                    $historyStmt->bindParam(1, $this->id);
                    $historyStmt->execute();

                    while ($historyRow = $historyStmt->fetch(PDO::FETCH_ASSOC)) {
                        $statusHistory[] = [
                            'status' => $historyRow['status'],
                            'timestamp' => $historyRow['created_at']
                        ];
                    }

                    // If no history records exist, create an initial "order placed" entry
                    if (empty($statusHistory)) {
                        $statusHistory[] = [
                            'status' => 'pending',
                            'timestamp' => $this->created_at
                        ];
                    }
                } catch (PDOException $e) {
                    error_log("Order::readOne - Error fetching status history: " . $e->getMessage());
                    // Default to created_at timestamp if history table doesn't exist
                    $statusHistory[] = [
                        'status' => 'pending',
                        'timestamp' => $this->created_at
                    ];
                }

                // Prepare billing information
                $billingInfo = [
                    'name' => $row['first_name'] . ' ' . $row['last_name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'] ?? '',
                    'address' => $row['address'] ?? '',
                    'city' => $row['city'] ?? '',
                    'state' => $row['state'] ?? '',
                    'zip_code' => $row['zip_code'] ?? ''
                ];

                // Return order data as an array for direct JSON encoding
                return [
                    'id' => $this->id,
                    'user_id' => $this->user_id,
                    'customer_name' => $row['first_name'] . ' ' . $row['last_name'],
                    'email' => $row['email'],
                    'total_amount' => $this->total_amount,
                    'status' => $this->status,
                    'shipping_address' => $this->shipping_address,
                    'payment_method' => $this->payment_method,
                    'created_at' => $this->created_at,
                    'updated_at' => $this->updated_at,
                    'items' => $this->items,
                    'status_history' => $statusHistory,
                    'billing_info' => $billingInfo
                ];
            }

            error_log("Order::readOne - Order not found with ID: " . $this->id);
            return null;
        } catch (PDOException $e) {
            error_log("Order::readOne - Error fetching order: " . $e->getMessage());
            return null;
        }
    }

    // Update order status
    public function updateStatus() {
        // First, check if we need to create the status_history table
        $this->ensureStatusHistoryTableExists();

        // Start transaction
        $this->conn->beginTransaction();

        try {
            // Update order status
            $query = "UPDATE " . $this->table_name . "
                    SET status = :status
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Sanitize input
            $this->status = htmlspecialchars(strip_tags($this->status));
            $this->id = htmlspecialchars(strip_tags($this->id));

            // Bind values
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":id", $this->id);

            // Execute query
            $result = $stmt->execute();

            if (!$result) {
                throw new Exception("Failed to update order status");
            }

            // Add entry to status history
            $historyQuery = "INSERT INTO order_status_history
                           (order_id, status, created_at)
                           VALUES (:order_id, :status, NOW())";

            $historyStmt = $this->conn->prepare($historyQuery);
            $historyStmt->bindParam(":order_id", $this->id);
            $historyStmt->bindParam(":status", $this->status);

            $historyResult = $historyStmt->execute();

            if (!$historyResult) {
                throw new Exception("Failed to record status history");
            }

            // Commit transaction
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->conn->rollBack();
            error_log("Order::updateStatus - Error: " . $e->getMessage());
            return false;
        }
    }

    // Ensure status history table exists
    private function ensureStatusHistoryTableExists() {
        try {
            // Check if status history table exists
            $tableCheck = $this->conn->query("SHOW TABLES LIKE 'order_status_history'");
            if ($tableCheck->rowCount() === 0) {
                error_log("Order::ensureStatusHistoryTableExists - Creating order_status_history table");

                // Create status history table
                $createTableSql = "CREATE TABLE IF NOT EXISTS order_status_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES " . $this->table_name . "(id) ON DELETE CASCADE
                )";

                $this->conn->exec($createTableSql);
                error_log("Order::ensureStatusHistoryTableExists - Table created successfully");
            }
        } catch (PDOException $e) {
            error_log("Order::ensureStatusHistoryTableExists - Error: " . $e->getMessage());
        }
    }

    // Get orders by status
    public function readByStatus() {
        $query = "SELECT o.*, u.email, u.first_name, u.last_name
                FROM " . $this->table_name . " o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.status = ?
                ORDER BY o.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->status);
        $stmt->execute();

        return $stmt;
    }

    // Get order items for a specific order
    public function getOrderItems($orderId) {
        error_log("Order::getOrderItems - Fetching items for order ID: " . $orderId);

        $query = "SELECT oi.*, p.name as product_name, p.image_url
                FROM " . $this->items_table . " oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $orderId);
            $stmt->execute();

            $items = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $items[] = $row;
            }

            error_log("Order::getOrderItems - Found " . count($items) . " items for order ID: " . $orderId);
            return $items;
        } catch (PDOException $e) {
            error_log("Order::getOrderItems - Error fetching items: " . $e->getMessage());
            return [];
        }
    }

    // Export orders to CSV
    public function exportToCSV() {
        $query = "SELECT o.id, o.total_amount, o.status, o.shipping_address, o.payment_method,
                         o.created_at, u.email, u.first_name, u.last_name
                FROM " . $this->table_name . " o
                LEFT JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $orders = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $orders[] = $row;
        }

        return $orders;
    }
}
?>
