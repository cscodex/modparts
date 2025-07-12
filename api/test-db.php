<?php
header("Content-Type: text/plain");

try {
    $conn = new PDO(
        "mysql:host=modpartdbcan.mysql.database.azure.com;dbname=modparts;charset=utf8mb4",
        "modadmin",
        "Zooming123$",
        [
            PDO::MYSQL_ATTR_SSL_CA => "/etc/ssl/certs/ca-certificates.crt",
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
    echo "✅ Connection successful!";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>
