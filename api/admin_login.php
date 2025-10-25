<?php

// admin_login.php

require_once '../vendor/autoload.php';
use \Firebase\JWT\JWT;

require_once 'Database.php';

$pdo = Database::getInstance();

$secret_key = "eM5PAHU7ejRHfcuy8qv1T6wORuA61W";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"));

if (isset($data->username) && isset($data->password)) {
    $username = $data->username;
    $password = $data->password;

    try {
        $stmt = $pdo->prepare("SELECT * FROM admin WHERE Username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$admin || !password_verify($password, $admin['Password'])) {
            echo json_encode(['message' => 'Invalid credentials']);
            exit;
        }

        $issued_at = time();
        $expiration_time = $issued_at + 3600;
        $payload = array(
            "iat" => $issued_at,
            "exp" => $expiration_time,
            "sub" => $admin['IDAdmin'],
        );

        $jwt = JWT::encode($payload, $secret_key, 'HS256');

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
