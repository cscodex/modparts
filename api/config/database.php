<?php
class Database {
    private $host = "127.0.0.1";
    private $db_name = "yamaha_rd_parts";  // make sure this matches Azure DB
    private $username = "root";
    private $password = ""; // replace with your actual password
    public $conn;

    public function getConnection() {
        $this->conn = null;
    
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]
            );
        } catch(PDOException $exception) {
            header("Content-Type: application/json; charset=UTF-8");
            http_response_code(500);
            echo json_encode(array("message" => "Database connection error: " . $exception->getMessage()));
            exit;
        }
    
        return $this->conn;
    }
}
?>
