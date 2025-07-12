<?php
class SimpleCartItem {
    private $conn;
    private $table_name = "cart_items";

    public $id;
    public $user_id;
    public $product_id;
    public $quantity;

    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }

    // Add item to cart (simplified version)
    public function addToCart() {
        try {
            // Check if the item already exists in the cart
            $check_query = "SELECT id, quantity FROM " . $this->table_name . " 
                            WHERE user_id = ? AND product_id = ?";
            
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->bindParam(1, $this->user_id);
            $check_stmt->bindParam(2, $this->product_id);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() > 0) {
                // Item exists, update quantity
                $row = $check_stmt->fetch(PDO::FETCH_ASSOC);
                $this->id = $row['id'];
                $new_quantity = $row['quantity'] + $this->quantity;
                
                $query = "UPDATE " . $this->table_name . " 
                          SET quantity = :quantity 
                          WHERE id = :id";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":quantity", $new_quantity);
                $stmt->bindParam(":id", $this->id);
                
                return $stmt->execute();
            } else {
                // Item doesn't exist, insert new
                $query = "INSERT INTO " . $this->table_name . " 
                          SET user_id = :user_id, 
                              product_id = :product_id, 
                              quantity = :quantity";
                
                $stmt = $this->conn->prepare($query);
                
                // Sanitize and bind values
                $stmt->bindParam(":user_id", $this->user_id);
                $stmt->bindParam(":product_id", $this->product_id);
                $stmt->bindParam(":quantity", $this->quantity);
                
                if ($stmt->execute()) {
                    $this->id = $this->conn->lastInsertId();
                    return true;
                }
                return false;
            }
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return false;
        }
    }

    // Get cart items for a user (simplified version)
    public function getUserCart() {
        try {
            $query = "SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, 
                             p.name, p.price
                      FROM " . $this->table_name . " ci
                      LEFT JOIN products p ON ci.product_id = p.id
                      WHERE ci.user_id = ?
                      ORDER BY ci.created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->user_id);
            $stmt->execute();
            
            return $stmt;
        } catch (PDOException $e) {
            echo "Error: " . $e->getMessage();
            return null;
        }
    }
}
?>
