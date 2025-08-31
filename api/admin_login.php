<?php
require_once '../vendor/autoload.php'; // Include the JWT library
use \Firebase\JWT\JWT;

require_once 'Database.php';

// Database connection details
$pdo = Database::getInstance();  // Singleton DB connection

$secret_key = "eM5PAHU7ejRHfcuy8qv1T6wORuA61W";

// Allow CORS if you're working with React frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Get POST data
$data = json_decode(file_get_contents("php://input"));

if (isset($data->username) && isset($data->password)) {
    $username = $data->username;
    $password = $data->password;

    try {
        // Prepare the SQL statement to check if the user exists
        $stmt = $pdo->prepare("SELECT * FROM admin WHERE Username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        // Fetch the admin data from the database
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$admin || !password_verify($password, $admin['Password'])) {
            echo json_encode(['message' => 'Invalid credentials']);
            exit;
        }

        // Create the JWT token
        $issued_at = time();
        $expiration_time = $issued_at + 3600;  // jwt valid for 1 hour from the issued time
        $payload = array(
            "iat" => $issued_at,
            "exp" => $expiration_time,
            "sub" => $admin['IDAdmin'],
        );

        $jwt = JWT::encode($payload, $secret_key, 'HS256');

        // Respond with the JWT token
        echo json_encode([
            "message" => "Login successful",
            "token" => $jwt
        ]);
    } catch (Exception $e) {
        echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['message' => 'Username and password are required']);
}
?>
