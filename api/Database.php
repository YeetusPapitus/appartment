<?php

// Database.php

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $host = 'localhost';
        $db   = 'appartment';
        $user = 'root';
        $pass = '';
        $dsn  = "mysql:host=$host;dbname=$db;charset=utf8mb4";

        try {
            $this->pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => 'Database connection failed.']);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }

        return self::$instance->pdo;
    }
}
?>
