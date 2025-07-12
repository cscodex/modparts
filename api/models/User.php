<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $email;
    public $password;
    public $first_name;
    public $last_name;
    public $address;
    public $city;
    public $state;
    public $zip_code;
    public $shipping_address;
    public $shipping_city;
    public $shipping_state;
    public $shipping_zip_code;
    public $billing_address;
    public $billing_city;
    public $billing_state;
    public $billing_zip_code;
    public $preferred_address;
    public $phone;
    public $preferred_payment_method;
    public $role;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all users
    public function read() {
        // Select all query
        $query = "SELECT
                    id, email, first_name, last_name, address, phone, role, created_at, updated_at
                FROM
                    " . $this->table_name . "
                ORDER BY
                    id DESC";

        // Prepare query statement
        $stmt = $this->conn->prepare($query);

        // Execute query
        $stmt->execute();

        return $stmt;
    }

    // Create new user
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    email = :email,
                    password = :password,
                    first_name = :first_name,
                    last_name = :last_name,
                    address = :address,
                    phone = :phone,
                    role = :role";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = htmlspecialchars(strip_tags($this->password));
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->role = htmlspecialchars(strip_tags($this->role));

        // Hash password
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);

        // Bind values
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":role", $this->role);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Check if email exists and password is correct
    public function login() {
        $query = "SELECT id, email, password, role, first_name, last_name
                FROM " . $this->table_name . "
                WHERE email = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->role = $row['role'];

            // Verify password
            if (password_verify($this->password, $row['password'])) {
                return true;
            }
        }

        return false;
    }

    // Get user by ID
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->email = $row['email'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->address = $row['address'];
            $this->phone = $row['phone'];
            $this->role = $row['role'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];

            // Check for additional profile fields
            $this->city = $row['city'] ?? null;
            $this->state = $row['state'] ?? null;
            $this->zip_code = $row['zip_code'] ?? null;
            $this->preferred_payment_method = $row['preferred_payment_method'] ?? null;

            // Return user data as an array
            return [
                'id' => $this->id,
                'email' => $this->email,
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'address' => $this->address,
                'phone' => $this->phone,
                'role' => $this->role,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
                'city' => $this->city,
                'state' => $this->state,
                'zip_code' => $this->zip_code,
                'shipping_address' => $this->shipping_address,
                'shipping_city' => $this->shipping_city,
                'shipping_state' => $this->shipping_state,
                'shipping_zip_code' => $this->shipping_zip_code,
                'billing_address' => $this->billing_address,
                'billing_city' => $this->billing_city,
                'billing_state' => $this->billing_state,
                'billing_zip_code' => $this->billing_zip_code,
                'preferred_address' => $this->preferred_address,
                'preferred_payment_method' => $this->preferred_payment_method
            ];
        }

        return false;
    }

    // Update user
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    first_name = :first_name,
                    last_name = :last_name,
                    address = :address,
                    phone = :phone
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":id", $this->id);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Check if email exists
    public function emailExists() {
        $query = "SELECT id, email, password, role
                FROM " . $this->table_name . "
                WHERE email = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return true;
        }

        return false;
    }

    // Update user profile
    public function updateProfile() {
        // First, check if we need to alter the table to add new columns
        $this->ensureProfileColumnsExist();

        $query = "UPDATE " . $this->table_name . "
                SET
                    first_name = :first_name,
                    last_name = :last_name,
                    address = :address,
                    phone = :phone,
                    city = :city,
                    state = :state,
                    zip_code = :zip_code,
                    shipping_address = :shipping_address,
                    shipping_city = :shipping_city,
                    shipping_state = :shipping_state,
                    shipping_zip_code = :shipping_zip_code,
                    billing_address = :billing_address,
                    billing_city = :billing_city,
                    billing_state = :billing_state,
                    billing_zip_code = :billing_zip_code,
                    preferred_address = :preferred_address,
                    preferred_payment_method = :preferred_payment_method
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->city = htmlspecialchars(strip_tags($this->city ?? ''));
        $this->state = htmlspecialchars(strip_tags($this->state ?? ''));
        $this->zip_code = htmlspecialchars(strip_tags($this->zip_code ?? ''));
        $this->shipping_address = htmlspecialchars(strip_tags($this->shipping_address ?? ''));
        $this->shipping_city = htmlspecialchars(strip_tags($this->shipping_city ?? ''));
        $this->shipping_state = htmlspecialchars(strip_tags($this->shipping_state ?? ''));
        $this->shipping_zip_code = htmlspecialchars(strip_tags($this->shipping_zip_code ?? ''));
        $this->billing_address = htmlspecialchars(strip_tags($this->billing_address ?? ''));
        $this->billing_city = htmlspecialchars(strip_tags($this->billing_city ?? ''));
        $this->billing_state = htmlspecialchars(strip_tags($this->billing_state ?? ''));
        $this->billing_zip_code = htmlspecialchars(strip_tags($this->billing_zip_code ?? ''));
        $this->preferred_address = htmlspecialchars(strip_tags($this->preferred_address ?? 'shipping'));
        $this->preferred_payment_method = htmlspecialchars(strip_tags($this->preferred_payment_method ?? 'credit_card'));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":state", $this->state);
        $stmt->bindParam(":zip_code", $this->zip_code);
        $stmt->bindParam(":shipping_address", $this->shipping_address);
        $stmt->bindParam(":shipping_city", $this->shipping_city);
        $stmt->bindParam(":shipping_state", $this->shipping_state);
        $stmt->bindParam(":shipping_zip_code", $this->shipping_zip_code);
        $stmt->bindParam(":billing_address", $this->billing_address);
        $stmt->bindParam(":billing_city", $this->billing_city);
        $stmt->bindParam(":billing_state", $this->billing_state);
        $stmt->bindParam(":billing_zip_code", $this->billing_zip_code);
        $stmt->bindParam(":preferred_address", $this->preferred_address);
        $stmt->bindParam(":preferred_payment_method", $this->preferred_payment_method);
        $stmt->bindParam(":id", $this->id);

        // Execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Ensure profile columns exist in the users table
    private function ensureProfileColumnsExist() {
        try {
            // Basic address fields
            $this->ensureColumnExists('city', "VARCHAR(100) DEFAULT NULL");
            $this->ensureColumnExists('state', "VARCHAR(100) DEFAULT NULL");
            $this->ensureColumnExists('zip_code', "VARCHAR(20) DEFAULT NULL");

            // Shipping address fields
            $this->ensureColumnExists('shipping_address', "TEXT DEFAULT NULL");
            $this->ensureColumnExists('shipping_city', "VARCHAR(100) DEFAULT NULL");
            $this->ensureColumnExists('shipping_state', "VARCHAR(100) DEFAULT NULL");
            $this->ensureColumnExists('shipping_zip_code', "VARCHAR(20) DEFAULT NULL");

            // Billing address fields
            $this->ensureColumnExists('billing_address', "TEXT DEFAULT NULL");
            $this->ensureColumnExists('billing_city', "VARCHAR(100) DEFAULT NULL");
            $this->ensureColumnExists('billing_state', "VARCHAR(100) DEFAULT NULL");
            $this->ensureColumnExists('billing_zip_code', "VARCHAR(20) DEFAULT NULL");

            // Preference fields
            $this->ensureColumnExists('preferred_address', "ENUM('shipping', 'billing') DEFAULT 'shipping'");
            $this->ensureColumnExists('preferred_payment_method', "VARCHAR(50) DEFAULT 'credit_card'");
        } catch (PDOException $e) {
            error_log("Error ensuring profile columns exist: " . $e->getMessage());
        }
    }

    // Helper method to check if a column exists and add it if it doesn't
    private function ensureColumnExists($columnName, $columnDefinition) {
        $stmt = $this->conn->query("SHOW COLUMNS FROM " . $this->table_name . " LIKE '" . $columnName . "'");
        if ($stmt->rowCount() === 0) {
            $this->conn->exec("ALTER TABLE " . $this->table_name . " ADD COLUMN " . $columnName . " " . $columnDefinition);
        }
    }
}
?>
