<?php

// admin_register.php

$host = 'localhost';
$db   = 'appartment';
$user = 'root';
$pass = '';
$dsn  = "mysql:host=$host;dbname=$db;charset=utf8mb4";

$username = 'markosego';
$password = 'nopass';

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $stmt = $pdo->prepare("INSERT INTO admin (Username, Password) VALUES (:username, :password)");
    $stmt->execute([
        ':username' => $username,
        ':password' => $hashedPassword
    ]);

    echo "Admin user '$username' added successfully!";
} catch (Exception $e) {
    echo "Failed to add admin: " . $e->getMessage();
}
?>
