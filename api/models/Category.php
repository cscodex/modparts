<?php
class Category {
    private $conn;
    private $table_name = "categories";

    public $id;
    public $name;
    public $description;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;

        // Ensure the categories table exists
        $this->ensureTableExists();
    }

    // Ensure the categories table exists
    private function ensureTableExists() {
        try {
            // Check if table exists
            $tableExists = false;
            try {
                $checkTable = "SELECT 1 FROM " . $this->table_name . " LIMIT 1";
                $this->conn->query($checkTable);
                $tableExists = true;
                error_log("Category: Table already exists");
            } catch (PDOException $e) {
                $tableExists = false;
                error_log("Category: Table does not exist, will create it");
            }

            // Only create the table if it doesn't exist
            if (!$tableExists) {
                // Create the table
                $createTable = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )";

                $result = $this->conn->exec($createTable);
                error_log("Category: Table creation result: " . ($result !== false ? "Success" : "Failed"));

                // Check if the table is empty
                $checkEmpty = "SELECT COUNT(*) as count FROM " . $this->table_name;
                $stmt = $this->conn->prepare($checkEmpty);
                $stmt->execute();
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                // Only insert test data if the table is empty
                if ($row['count'] == 0) {
                    error_log("Category: Table is empty, inserting test data");

                    // Insert test categories for development
                    $testCategories = [
                        [
                            'name' => 'Engine Parts',
                            'description' => 'Parts for the engine of Yamaha RD motorcycles'
                        ],
                        [
                            'name' => 'Exhaust Systems',
                            'description' => 'Exhaust systems for Yamaha RD motorcycles'
                        ],
                        [
                            'name' => 'Electrical Components',
                            'description' => 'Electrical components for Yamaha RD motorcycles'
                        ],
                        [
                            'name' => 'Body Parts',
                            'description' => 'Body parts for Yamaha RD motorcycles'
                        ]
                    ];

                    foreach ($testCategories as $category) {
                        $insertQuery = "INSERT INTO " . $this->table_name . "
                            (name, description)
                            VALUES (?, ?)";

                        $stmt = $this->conn->prepare($insertQuery);
                        $stmt->bindParam(1, $category['name']);
                        $stmt->bindParam(2, $category['description']);

                        $stmt->execute();
                    }

                    error_log("Category: Test categories inserted");
                }
            }
        } catch (PDOException $e) {
            error_log("Category: Error checking/creating table: " . $e->getMessage());
        }
    }

    // Read all categories
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Read single category
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->description = $row['description'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    // Create category
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    name = :name,
                    description = :description";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Update category
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    name = :name,
                    description = :description
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":id", $this->id);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Delete category
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>
